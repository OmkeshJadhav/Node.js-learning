## Setup
+ npm init -y
+ node_modules
+ package.json & package-lock.json
    ```
    {
    "name": "capstone-project",
    "version": "1.0.0",
    "description": "",
    "main": "dist/server.js",
    "scripts": {
        "dev": "tsx watch src/server.ts",
        "build": "tsc",
        "start": "node dist/server.js",
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "type": "commonjs",
    "dependencies": {
        "cors": "^2.8.6",
        "dotenv": "^17.4.2",
        "express": "^5.2.1",
        "pino": "^10.3.1"
    },
    "devDependencies": {
        "@types/cors": "^2.8.19",
        "@types/express": "^5.0.6",
        "@types/node": "^26.1.2",
        "pino-pretty": "^13.1.3",
        "tsx": "^4.23.1",
        "typescript": "^7.0.2"
    }
    }
    ```
+ tsconfig.json  
    ```
    {
        "compilerOptions": {
            "target": "ES2022",
            "module": "NodeNext",
            "moduleResolution": "NodeNext",
            "rootDir": "./src",
            "outDir": "./dist",
            "strict": true,
            "noImplicitAny": true,
            "strictNullChecks": true,
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true,
            "skipLibCheck": true,
            "sourceMap": true,
            "declaration": true,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "noImplicitReturns": true,
            "resolveJsonModule": true,
            "types": ["node"]
        },
        "include": [
            "src/**/*"
        ],
        "exclude": [
            "node_modules",
            "dist"
        ]
    }
    ```

## Folder Structure 
- Create src folder
- Create server.ts as entry file inside src
- Install express and types of express
    ```
        npm i express
        npm i -D @types/express
    ```
- Install dotenv
    ```
        npm i dotenv
    ```
- Install cors
    ```
        npm i cors
    ```
- Create below folders inside src
    + config
    + lib
    + middlewares
    + routes  

## env configuration
- Add .env file at the root level
    In .env add PORT and NODE_ENV as env variables
    ```
    PORT=5001

    NODE_ENV='development'

    LOGGER_LEVEL='info'

    DATABASE_URL=postgresql://postgres:postgres@localhost:5444/nodejs-capstone
    ```
- Create env.ts file in config folder
- In env.ts - Configure environment variables using dotenv.config() for port, nodeEnv and isProduction
    ```
    import dotenv from 'dotenv'

    dotenv.config();

    export const env = {
        port: Number(process.env.PORT ?? 5001),
        nodeEnv: process.env.NODE_ENV ?? 'development',
        isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
    } as const;
    ```  
- We can also create function to check if env variable is present
    ```
    import dotenv from 'dotenv'

    dotenv.config();

    const checkRequiredEnvVariables = (key: string):string => {
        const value = process.env[key]

        if(!value){
            throw new Error(`Missing env variable for ${key}`)
        }

        return value
    }

    export const env = {
        port: Number(process.env.PORT ?? 5001),
        nodeEnv: process.env.NODE_ENV ?? 'development',
        isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
        loggerLevel: process.env.LOGGER_LEVEL ?? 'info',
        databaseUrl: checkRequiredEnvVariables('DATABASE_URL')
    } as const;
    ```

## app.ts 
- Create app.ts file at the root of src
- app.ts is entry point for express and express related logic and sub-base file for the project
- Express will help us to create web server
- Create creatApp function and inside it use app.use middleware with express.json()
    - app.use(express.json()) return middleware that only parses json and only looks at request where Content-Type header matches the type option
    ```
    import express from 'express'

    export const creatApp = () => {
        const app = express();

        app.use(express.json());
    }

    return app;
    ```


## server.ts
- Create server.ts file at the root level of src
- This is the base file of the project
- It executes createApp function of app.ts and listen to the server
    ```
    import { createApp } from "./app";
    import { env } from "./config/env";
    import { logger } from "./lib/logger";

    const app = createApp();

    app.listen(env.port, () => {
        logger.info(`Server is running on PORT ${env.port})`)
    });
    ```


## Update scripts in package.json
- For "dev" script - "tsx watch src/server.ts" - watch/runs base file of the project src/server.ts
- For "build" - "tsc" - Compiles .ts  .js into dist
- For "start" - "node dist/server.js" - Runs the compiled production server in dist folder using node
- Also update "main" in package.json to the compiled production entry point in dist folder


## logger configuration  
- Add logger.ts to lib folder
- Create logger function using pino
- For setup - use google/chatgpt standard pino steup
    ```
    import pino from 'pino'
    import { env } from '../config/env'

    export const logger = pino({
        level: env.loggerLevel,
        transport: env.isProduction ? undefined : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard'
            }
        }
    })
    ```


## Global Error Handler  
- Create errorHandler.ts in middleware folder
- Create errorHandler function
- Function should receive - err: Error, _req: Request, res: Response, _next: NextFunction - as arguments and return void
- Inside the function log the error and send response
    ```
    import { NextFunction, Request, Response } from "express";
    import { logger } from "../lib/logger";

    export const errorHandler = (
        err: Error,
        _req: Request,
        res: Response,
        _next: NextFunction
    ): void => {
        logger.error({err}, 'Unhandled Error');

        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
    ```
- Add errorHandler middleware in app.ts as app.use(errorHandler)


## Not Found Middleware
- Create notFound.ts middleware
    ```
    import { Request, Response } from "express";

    export const notFound = (_req: Request, res: Response): void => {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        })
    }
    ```


## express.urlencoded
- Middleware function in Express to parse incoming HTML form submission
- Parses incoming requests with URL-encoded payloads.
    ```
        app.use(express.urlencoded({extended: true}))
    ```


## CORS: Cross Origin Resource Sharing
- CORS is a browser enforced security mechanism
- CORS prevents a web page from one domain from making request to API hosted on a completely different domains unless server explicitly grants permission
- Create cors-config.ts in config folder
    + Create origin function, methods allowed, allowedHeaders, exposedHeaders, credentials, preflightContinue, maxAge, optionsSuccessStatus
        - origin -> this will tell that which origin are allowed to access your APIs
        - methods -> which methods are allowed
        - allowedHeaders -> which headers are allowed
        - exposedHeaders -> expose all the headers that can be exposed to the client
        - credentials -> Enables support for cookies and authorization
        - preflightContinue -> Pass the CORS preflight response to the next handler
        - maxAge -> cache the preflight responses for the mentioned time (in seconds) - avoid sending options requests multiple times
        - optionsSuccessStatus -> Provide a status code to use for successful OPTIONS requests 
    ```
    import cors from 'cors'

    export const configureCors = () => {
        return cors({

            // origin -> this will tell that which origin are allowed to access your APIs
            origin: (origin, callback) => {
                const whitelistedOrigins = [
                    'http://localhost:3000',  // local dev
                    'https://yourcustomdomain.com'  // production domain
                ]

                if (!origin || whitelistedOrigins.includes(origin)) {    // !origin -> Some requests do not include an Origin header, such as:Postman requests, Mobile apps, Server-to-server requests, Same-origin requests in some cases - In these cases origin is undefined/null/empty
                    callback(null, true)  // true -> Giving permission so that request can be called
                } else {
                    callback(new Error('Not allowed by cors.'))
                }
            },

            // methods -> which methods are allowed
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],

            // allowedHeaders -> which headers are allowed
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'Accept-Version'
            ],

            // exposedHeaders -> expose all the headers that can be exposed to the client
            exposedHeaders: [
                'Content-Range',
                'X-Content-Range',
                'X-Total-Count'
            ],

            // credentials -> Enables support for cookies and authorization
            credentials: true,

            // preflightContinue -> Pass the CORS preflight response to the next handler
            preflightContinue: false,

            // maxAge -> cache the preflight responses for the mentioned time (in seconds) - avoid sending options requests multiple times
            maxAge: 600,
            
            // optionsSuccessStatus -> Provide a status code to use for successful OPTIONS requests 
            optionsSuccessStatus: 204
        })
    }
    ```
- Import cors-config.ts in app.ts and then use as middleware
    ```
    app.use(configureCors())
    ```


## ROUTES

### Creating route
- create route with names like 'health.route.ts' for a specific api route in routes folder
- import Router from Express
- Assign the route variable to Router function and then used http methods on this variable
    ```
    import { Router } from 'express';

    export const healthRouter = Router()

    healthRouter.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Health route is working.'
        });
    });
    ```

### Plugging all routes in single entry file
- In routes folder, create an entry file index.ts
- In this, we will combine all the routes of the application to plug all the routes in one place as middleware by importing all routes in this file.
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    ```

### Using apiRouter in app.ts as middleware
- Now use apiRouter from index.ts in main app.ts as middleware - after adding '/api' as prefix
    ```
        app.use('/api', apiRouter)  
    ```
        - actual endpoints become /api/......
        - whenever a frontend/client request starts with /api, Express forwards that request to apiRouter for further routing.


## DOCKER
- Create docker-compose.yml at the root.
    ```
    services:
        postgres:
            image: postgres:18-alpine
            container_name: nodejs-capstone-project
            restart: unless-stopped

            ports:
            - "5444:5432"

            environment:
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: nodejs-capstone

            volumes:
            - postgres-data:/var/lib/postgresql

    volumes:
        postgres-data:

    ```
- In .env, add DATABASE_URL variable
    ```
    postgresql://postgres:postgres@localhost:5444/nodejs-capstone
           │          │       │       │        │        │
           │          │       │       │        │        └── Database
           │          │       │       │        └── Port
           │          │       │       └── Host
           │          │       └── Password
           │          └── Username
           └── Database protocol
    ```


## CUSTOM MIGRATIONS

### Create Tables
- Created migrations folder at the root
- In migrations folder, created 4 sql files
    - 001_enable_pgcryto.sql: CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    - 002_create_user_table.sql: id, email, password_hash, google_id, role, created_at, updated_at
    - 003_create_support_tasks_table.sql: id, title, status, user_id
    - 004_create_banners_table.sql: id, image_url, cloudinary_public_id, created_at, updated_at

### Create PostgreSQL connection pool 
- Install pg package and its types
    ```
    npm install pg
    npm i --save-dev @types/pg
    ```
    - pg is a postgres client for Node.js (similar to mongoose for mongoDB). It acts as medium that allows Node.js app to connect, query and interact with postgres DB. 
    - It allows to write raw SQL directly in JS/TS code.
- Create db.ts in src/lib/db.ts 
    ```
    import { Pool } from 'pg'
    import { env } from '../config/env'

    export const pool = new Pool({
        connectionString: env.databaseUrl
    })
    ```
    - creates a PostgreSQL connection pool that your Node.js application can use to communicate with the database.
    - Instead of opening a new database connection every time you execute a query, the pool keeps connections available and reuses them.
    - Why use a Pool instead of creating a connection every time? 
        - Imagine your application receives 100 requests:
            ```
            Request 1 ──┐
            Request 2 ──┤
            Request 3 ──┤
            Request 4 ──┤
                ...     ├──→ Connection Pool ──→ PostgreSQL
            Request 100 ┘
            ```
        - Without a pool
            ```
            Request → Create connection → Query → Close connection
            Request → Create connection → Query → Close connection
            Request → Create connection → Query → Close connection
            ```  


### Custom Migration
- Why migration ? Migrations allow database schema changes made by one developer to be version-controlled and shared with other developers. When another developer pulls those migration files and runs the migration command, the pending changes are automatically applied to their local database, keeping their database structure in sync.
- Create migrate.ts in scripts folder or db folder: /src/scripts/migrate.ts or /src/db/migrate.ts
    ```
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
            // Starts a PostgreSQL TRANSACTION - Perform these operations together. Either all of them succeed, or none of them should be saved."
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
    ```
- What runMigration() function actually does ?
    1. Read SQL file
    2. Get a DB connection
    3. BEGIN transaction
    4. Execute SQL
    5. Record migration as completed
    6. COMMIT
    7. If anything fails → ROLLBACK
    8. Return connection to pool

- Complete process
    ```
            npm run migrate
                    │
                    ↓
            ┌──────────────────┐
            │ Create migrations│
            │      table       │
            └────────┬─────────┘
                    ↓
            Check executed files
                    │
                    ↓
            Read migrations/
                    │
                    ↓
            Find pending files
                    │
                    ↓
            ┌────────────────┐
            │ 001_users.sql  │
            │ 002_posts.sql  │
            │ 003_comments   │
            └───────┬────────┘
                    ↓
            Run each pending
                migration
                    │
                    ↓
            Transaction BEGIN
                    │
                    ↓
                Execute SQL
                    │
                    ↓
            Record migration name
                    │
                    ↓
            Transaction COMMIT
                    │
                    ↓
            Return client to pool
    ```


## AppError in errorHandler
- Create AppError.ts inside errors folder: /src/errors/AppError.ts
- Create constructor for AppError
    ```
    AppError.ts

    export class AppError extends Error {
        statusCode: number;

        constructor(statusCode: number, message: string){
            super(message),
            this.statusCode = statusCode;
        }
    }
    ```
- Add AppError constructor to errorHandler.ts in middlewares
    ```
    if(err instanceof AppError){
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
        return
    }
    ```

### Why use AppError
- AppError lets your application throw structured, expected errors with an HTTP status code, while errorHandler centrally converts those errors into HTTP responses; unexpected errors fall back to 500.
- AppError.ts: Defines the type of error your application intentionally throws:
    ```
    throw new AppError(404, "User not found");
    ```
- errorHandler.ts: Defines how errors are converted into HTTP responses:
    ```
    AppError → its statusCode
    Unknown Error → 500
    ```
- if we don't use AppError then we have to manually handle all these status code and error message inside errorHandler like
    ```
    if (err.message === "User not found") {
        return res.status(404).json(...);
    }

    if (err.message === "Email already exists") {
        return res.status(409).json(...);
    }

    if (err.message === "Invalid input") {
        return res.status(400).json(...);
    }
    ```

## Folder Structure
1. Repositories - DB related logic
    - e.g. In src/repositories/user.repository.ts
2. Services - Business logic like validations, helper functions, JWT etc.
    - e.g. In src/services/auth.service.ts
3. Routes - Routes based on features. All routes are combined into Root route file
    - e.g. src/routes/auth.routes.ts

  
## User Registration Flow
1. Define user type
    ```
    export type user = {
        id: string,
        email: string,
        role: string,
        created_at: Date
    }
    ```

2. Create route for auth
    - post method
    - "/register" path & (req, res, next) 
    - Get email and password from request body
    - Call registerUser function (from auth service) with email and password - We haven't yet created this function
    - Send response with status code 201
    - Catch the error 
    ```
    import { Router } from "express";
    import { registerUser } from "../services/auth.service";

    export const authRouter = Router();

    authRouter.post("/register", async (req, res, next) => {
        try {
            const { email, password } = req.body
            
            // Do not write service logic here - Service logic is in service file
            await registerUser(email, password)

            res.status(201).json({
                success: true,
                message: "Registration successful. Please login to continue."
            })
        } catch (error) {
            next(error)
        }
    })
    ```

3. Provide the auth route to root route
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';
    import { authRouter } from './auth.routes';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    apiRouter.use("/auth", authRouter)
    ```

4. Auth service (src/services/auth.service.ts) 
    - Create registerUser function
        ```
        export const registerUser = async (email: string, password: string): Promise<void> => {}
        ```
    - Verify if email and password are present
        ```
        if (!email || !password) {
            throw new AppError(400, "Email and password are required!")
        }
        ```
    - Verify password length is more than minimum password length
        - Best practice: Create constant folder and maintain constant values like password length inside it
        ```
        if (password.length < min_password_length) {
            throw new AppError(400, "Password must be at least 6 characters.")
        }
        ```
    - normalize the email to lower case and trim any white spaces
        ```
        const normalizeEmail = email.toLowerCase().trim()
        ```
    - Find if the user is already present - As it is a DB related task create findUser function in repositories
        ```
        const existingUser = await findUserByEmail(normalizeEmail)
        ```
    - If email of user is already present then throw error
        ```
        if (existingUser) {
            throw new AppError(409, "Email already exists.")
        }
        ```
    - Create password hash using bcrypt (salt_round using constant)
        ```
        const password_hash = await bcrypt.hash(password, salt_round)
        ```
    - Call createUser function with email and password hash to save the user data in the DB - As it is a DB related task create createUser function in repositories
        ```
        await createUser(email, password_hash)
        ```

5. Create user.repository.ts (src/repositories/user.repository.ts) for DB related logic
    - Create findUserByEmail function. The function will return a user (if found) or null (if not found)
        ```
        export const findUserByEmail = async (email: string): Promise<user | null> => {}
        ```
    - Write query to find user - It will
        ```
            const result = await pool.query<DBUserRow>(
                "SELECT id, email, role, created_at FROM users WHERE email = $1",
                [email]
            )
        ```
    - Create DBUserRow type in /src/types/user.ts - Actually it is what we query
        ```
        export type DBUserRow = {
            id: string,
            email: string,
            role: string,
            created_at: Date
        }
        ```
    - return the result
        ```
            return result.rows[0] ?? null
        ```

6. Create createUser function. The function will return the created user
    - Create user
        ```
        export const createUser = async (email: string, password_hash: string): Promise<user> => {}
        ```
    - Write query to insert the new user into the DB
        ```
        const result = await pool.query<DBUserRowWithPassword>(
            `INSERT INTO users (email, password_hash)
                VALUES($1, $2)
                RETURNING id, email, password_hash, role, created_at
            `,
            [email, password_hash]
        )
        ```
    - Create DBUserRowWithPassword type in /src/types/user.ts
        ```
        export type DBUserRowWithPassword = DBUserRow & {
            password_hash: string | null;
        } 
        ```
    - return created user data
        ```
        return result.rows[0];
        ```


### /types/user.ts - Define types
    ```
    export type user = {
        id: string,
        email: string,
        role: string,
        created_at: Date
    }

    export type DBUserRow = {
        id: string,
        email: string,
        role: string,
        created_at: Date
    }

    export type DBUserRowWithPassword = DBUserRow & {
        password_hash: string | null;
    } 
    ```

### auth.routes.ts - For Auth Routing
    ```
    import { Router } from "express";
    import { registerUser } from "../services/auth.service";

    export const authRouter = Router();

    authRouter.post("/register", async (req, res, next) => {
        try {
            const { email, password } = req.body
            
            // Do not write servive logic here - Service logic is in service file
            await registerUser(email, password)

            res.status(201).json({
                success: true,
                message: "Registration successful. Please logion to continue."
            })
        } catch (error) {
            next(error)
        }
    })
    ```

### index.ts - root route
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';
    import { authRouter } from './auth.routes';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    apiRouter.use("/auth", authRouter)
    ```


### auth.service.ts - Auth Service
    ```
    import { min_password_length, salt_round } from "../constants/auth.constants"
    import { AppError } from "../errors/AppError"
    import { createUser, findUserByEmail } from "../repositories/user.repository"
    import bcrypt from "bcrypt"

    export const registerUser = async (email: string, password: string): Promise<void> => {
        if (!email || !password) {
            throw new AppError(400, "Email and password are required!")
        }

        if (password.length < min_password_length) {
            throw new AppError(400, "Password must be at least 6 characters.")
        }

        const normalizeEmail = email.toLowerCase().trim()

        const existingUser = await findUserByEmail(normalizeEmail)

        if (existingUser) {
            throw new AppError(409, "Email already exists.")
        }

        const password_hash = await bcrypt.hash(password, salt_round)

        await createUser(email, password_hash)
    }
    ```


### user.repository.ts - User repository (For DB related logic)
    ```
    import { pool } from "../lib/db";
    import { DBUserRow, user } from "../types/user";

    export const findUserByEmail = async (email: string): Promise<user | null> => {
        const result = await pool.query<DBUserRow>(
            "SELECT id, email, role, created_at FROM users WHERE email = $1",
            [email]
        )

        return result.rows[0] ?? null
    }

    export const createUser = async (email: string, password_hash: string): Promise<user> => {
        const result = await pool.query<DBUserRowWithPassword>(
            `INSERT INTO users (email, password_hash)
                VALUES($1, $2)
                RETURNING id, email, password_hash, role, created_at
            `,
            [email, password_hash]
        )

        return result.rows[0];
    }
    ```  


## User Login Flow
    ```

    ```