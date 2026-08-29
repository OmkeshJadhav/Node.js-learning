import path from "node:path";
import { pool } from "../lib/db";
import fs from "node:fs";
import { logger } from "../lib/logger";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

const CREATE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
)
`;

type MigrationRow = {
    name: string;
};

async function getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query<MigrationRow>(
        "SELECT name FROM migrations ORDER BY name",
    );

    return result.rows.map((row: MigrationRow) => row.name);
}

function getMigrationFiles(): string[] {
    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".sql"))
        .sort();
}

async function runMigration(fileName: string): Promise<void> {
    // Node reads file from path 'MIGRATIONS_DIR/fileName' and assign content of file to a variable (SQL as a string)
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, fileName), "utf-8");

    // Give me one database connection from the pool.
    const client = await pool.connect();

    try {
        // Starts a PostgreSQL transaction - Perform these operations together. Either all of them succeed, or none of them should be saved."
        await client.query("BEGIN");

        // Execute the migration sql i.e. file content assigned to variable
        await client.query(sql);

        // Insert entry in migrations table - $1 is a parameterized query & [fileName] provides the value for $1.
        await client.query("INSERT INTO migrations (name) values ($1)", [fileName]);

        // permanently commits the transaction - Both table creation and entry insertion operations are committed.
        await client.query("COMMIT");

        logger.info(`migration completed: ${fileName}`);
    } catch (error) {
        // if something fails - ROLLBACK - Undo everything done in this transaction. - So don't end up with a partially applied migration.
        await client.query("ROLLBACK");
        throw error;
    } finally {
        // give back connection borrowed from the pool - This does not close the entire database connection pool.
        client.release();
    }
}

const migrate = async(): Promise<void> => {
    // 1. Create Migrations Table
    await pool.query(CREATE_MIGRATIONS_TABLE_SQL);

    // 2. Get already executed migrations 
    const executed = new Set(await getExecutedMigrations());

    // 3. Get pending migration files
    const pending = getMigrationFiles().filter((file) => !executed.has(file));

    if (pending.length === 0) {
        logger.info("no pending migration");
        return;
    }

    // 4. Run migration on pending files
    for (const fileName of pending) {
        await runMigration(fileName);
    }

    logger.info("all migrations completed");
}

migrate()
    .catch((error) => {
        logger.error({ err: error }, "Migrations failed");
        process.exit(1);
    })
    .finally(() => pool.end());
