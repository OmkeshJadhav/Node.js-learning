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
        "start": "node dist/server.js"
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
        "@types/bcrypt": "^6.0.0",
        "@types/cors": "^2.8.19",
        "@types/express": "^5.0.6",
        "@types/node": "^26.1.2",
        "@types/pg": "^8.23.1",
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
- Create createApp function and inside it use app.use middleware with express.json()
    - app.use(express.json()) return middleware that only parses json and only looks at request where Content-Type header matches the type option
    ```
    import express from 'express'
    import { errorHandler } from './middlewares/errorHandler';
    import { notFound } from './middlewares/notFound';
    import { configureCors } from './config/cors-config';
    import { apiRouter } from './routes';

    export const createApp = () => {
        const app = express();
        
        app.use(configureCors())

        app.use(express.json());
        app.use(express.urlencoded({extended: true}))

        app.use('/api', apiRouter)
        app.use(notFound);

        app.use(errorHandler);

        return app
    }
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
    - 001_enable_pgcrypto.sql: CREATE EXTENSION IF NOT EXISTS "pgcrypto";
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
            super(message);
            this.statusCode = statusCode;
            this.name = 'AppError';
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
- Why registration? A new user sends email & password. The server validates them, makes sure the email is not already taken, hashes the password and saves the user in the DB. The user can then login (see User Login Flow).
- Layers used (see Folder Structure above): Route → Service → Repository → DB
- Flow
    ```
    POST /api/auth/register { email, password }
                │
                ↓
        register route (auth.routes.ts)
                │
                ↓
        registerUser (auth.service.ts)
                │
                ├── email/password missing ──→ AppError 400
                │
                ├── password too short ──→ AppError 400
                │
                ↓
        normalize email (lowercase + trim)
                │
                ↓
        findUserByEmail (user.repository.ts)
                │
                ├── email already exists ──→ AppError 409
                │
                ↓
        bcrypt.hash(password, salt_round)
                │
                ↓
        createUser(email, password_hash) (user.repository.ts)
                │
                ↓
        201 { success, message }
    ```

### 1. Install bcrypt and its types
- bcrypt is used to hash the password before saving it in the DB. Never store plain text passwords.
    ```
    npm i bcrypt

    npm i -D @types/bcrypt
    ```

### 2. Create constants in src/constants/auth.constants.ts
- Best practice: Create constant folder and maintain constant values like password length inside it
    ```
    export const min_password_length = 6;

    export const salt_round = 10;
    ```
    - salt_round -> how many times bcrypt processes the password. Higher = more secure but slower. 10 is a common default.

### 3. Define user types in src/types/user.ts
- user -> user data we return from functions (without password)
- DBUserRow -> Actually it is what we query from users table (without password)
- DBUserRowWithPassword -> DBUserRow + password_hash. `password_hash` is `string | null` because users created via Google login won't have a password.
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

### 4. Create user.repository.ts (src/repositories/user.repository.ts) for DB related logic
#### 4.1 findUserByEmail
- Create findUserByEmail function. The function will return a user (if found) or null (if not found)
    ```
    export const findUserByEmail = async (email: string): Promise<user | null> => {}
    ```
- Write query to find user - `$1` is a parameterized query & `[email]` provides the value for $1 (prevents SQL injection)
    ```
    const result = await pool.query<DBUserRow>(
        "SELECT id, email, role, created_at FROM users WHERE email = $1",
        [email]
    )
    ```
- return the result - first row if found, else null
    ```
    return result.rows[0] ?? null
    ```

#### 4.2 createUser
- Create createUser function. The function will return the created user
    ```
    export const createUser = async (email: string, password_hash: string): Promise<user> => {}
    ```
- Write query to insert the new user into the DB - `RETURNING` returns the inserted row, so no need of a separate SELECT query
    ```
    const result = await pool.query<DBUserRowWithPassword>(
        `INSERT INTO users (email, password_hash)
            VALUES($1, $2)
            RETURNING id, email, password_hash, role, created_at
        `,
        [email, password_hash]
    )
    ```
- return created user data
    ```
    return result.rows[0];
    ```

### 5. Create registerUser function in src/services/auth.service.ts
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
- Verify password length is more than minimum password length (min_password_length from constants)
    ```
    if (password.length < min_password_length) {
        throw new AppError(400, "Password must be at least 6 characters.")
    }
    ```
- normalize the email to lower case and trim any white spaces - so "ABC@x.com " and "abc@x.com" are treated as same email
    ```
    const normalizeEmail = email.toLowerCase().trim()
    ```
- Find if the user is already present - As it is a DB related task we use findUserByEmail from repositories
    ```
    const existingUser = await findUserByEmail(normalizeEmail)
    ```
- If email of user is already present then throw error - 409 Conflict
    ```
    if (existingUser) {
        throw new AppError(409, "Email already exists.")
    }
    ```
- Create password hash using bcrypt (salt_round using constant)
    ```
    const password_hash = await bcrypt.hash(password, salt_round)
    ```
- Call createUser function with email and password hash to save the user data in the DB - As it is a DB related task we use createUser from repositories
    ```
    await createUser(normalizeEmail, password_hash)
    ```

### 6. Create register route in src/routes/auth.routes.ts
- post method
- "/register" path & (req, res, next)
- Get email and password from request body
- Call registerUser function (from auth service) with email and password
- Send response with status code 201 (Created)
- Catch the error and pass it to errorHandler using next(error)
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

### 7. Provide the auth route to root route in src/routes/index.ts
- All auth routes get "/auth" prefix → final endpoint becomes /api/auth/register
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';
    import { authRouter } from './auth.routes';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    apiRouter.use("/auth", authRouter)
    ```
- Test: POST /api/auth/register with body
    ```
    {
        "email": "test@example.com",
        "password": "123456"
    }
    ```

### Final files - Registration
#### /types/user.ts - Define types
- Complete file
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

#### auth.routes.ts - For Auth Routing
- Complete file
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

#### index.ts - root route
- Complete file
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';
    import { authRouter } from './auth.routes';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    apiRouter.use("/auth", authRouter)
    ```

#### auth.service.ts - Auth Service
- Complete file
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

        await createUser(normalizeEmail, password_hash)
    }
    ```

#### user.repository.ts - User repository (For DB related logic)
- Complete file
    ```
    import { pool } from "../lib/db";
    import { DBUserRow, DBUserRowWithPassword, user } from "../types/user";

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
- Why login? The user sends email & password. If they are correct, the server returns a signed JWT access token. The client sends this token in the Authorization header for protected routes (see Authentication Middleware).
- Flow
    ```
    POST /api/auth/login { email, password }
                │
                ↓
        login route (auth.routes.ts)
                │
                ↓
        loginUser (auth.service.ts)
                │
                ├── email/password missing ──→ AppError 400
                │
                ↓
        findUserByEmailWithPassword (user.repository.ts)
                │
                ├── user not found / no password_hash ──→ AppError 401
                │
                ↓
        bcrypt.compare(password, password_hash)
                │
                ├── not matching ──→ AppError 401
                │
                ↓
        signAccessToken({ userId, email, role }) (jwt.ts)
                │
                ↓
        200 { success, message, data: { accessToken } }
    ```

### 1. Install jsonwebtoken and its types
- jsonwebtoken is used to create (sign) and verify JWT tokens
    ```
    npm i jsonwebtoken

    npm i -D @types/jsonwebtoken
    ```

### 2. Add JWT env variables
- Add JWT_SECRET & JWT_ACCESS_EXPIRES_IN in .env
    ```
    JWT_SECRET='super_secret_jwt'

    JWT_ACCESS_EXPIRES_IN='30m'
    ```
- Add them to src/config/env.ts using checkRequiredEnvVariables - so app fails at startup if they are missing
    ```
    export const env = {
        port: Number(process.env.PORT ?? 5001),
        nodeEnv: process.env.NODE_ENV ?? 'development',
        isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
        loggerLevel: process.env.LOGGER_LEVEL ?? 'info',
        databaseUrl: checkRequiredEnvVariables('DATABASE_URL'),
        jwtAccessSecret: checkRequiredEnvVariables('JWT_SECRET'),
        jwtAccessExpiresIn: checkRequiredEnvVariables('JWT_ACCESS_EXPIRES_IN')
    } as const;
    ```

### 3. Create TokenPayload type in src/types/user.ts
- This is the data we store inside the JWT. Never store password or sensitive data in it - JWT payload is only encoded (base64), not encrypted.
    ```
    export type TokenPayload = {
        userId: string,
        email: string,
        role: string
    }
    ```

### 4. Create signAccessToken function in src/lib/jwt.ts
- jwt.sign creates a token from payload, signed with secret, with expiry time
- `as SignOptions['expiresIn']` -> env value is a plain string but jsonwebtoken expects specific format like '30m', '1h' - so we cast it
    ```
    import { env } from "../config/env";
    import { TokenPayload } from "../types/user";
    import jwt, {SignOptions} from "jsonwebtoken"

    export const signAccessToken = (payload: TokenPayload): string => {
        const options: SignOptions = {
            expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn']
        }

        return jwt.sign(payload, env.jwtAccessSecret, options)
    }
    ```

### 5. Create findUserByEmailWithPassword in src/repositories/user.repository.ts
- findUserByEmail (used in register) does not select password_hash. For login we need password_hash to compare, so we create a separate function.
- Keeping them separate makes sure password_hash is fetched only when really needed.
    ```
    export const findUserByEmailWithPassword = async(email: string): Promise<DBUserRowWithPassword | null> => {
        const result = await pool.query<DBUserRowWithPassword>(
            `
            SELECT id, email, role, password_hash, created_at
            FROM users
            WHERE email = $1
            `,
            [email]
        )

        return result.rows[0] ?? null;
    }
    ```

### 6. Create loginUser function in src/services/auth.service.ts
- Validate email & password are present - else 400
- Normalize the email (same as register, so "ABC@x.com " matches "abc@x.com")
- Find user using findUserByEmailWithPassword
- If user not found or password_hash is null (e.g. Google login user) - 401
- Compare provided password with stored password_hash using bcrypt.compare - if not matching - 401
- Sign access token with userId, email, role and return it
- Note: Same message "Invalid email or password." for both wrong email & wrong password - so attacker can't find out which emails are registered
    ```
    export const loginUser = async (email: string, password: string): Promise<{accessToken: string}> => {
        if (!email || !password) {
            throw new AppError(400, "Email and password are required!")
        }

        const normalizeEmail = email.toLowerCase().trim();

        const user = await findUserByEmailWithPassword(normalizeEmail)

        if(!user?.password_hash){
            throw new AppError(401, "Invalid email or password.")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if(!isPasswordValid){
            throw new AppError(401,  "Invalid email or password.")
        }

        const accessToken = signAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role
        })

        return {accessToken}
    }
    ```

### 7. Create login route in src/routes/auth.routes.ts
- Get email & password from req.body
- Call loginUser and destructure accessToken from returned object
- Send response with status 200 and access token
- Any AppError thrown from service goes to errorHandler via next(error)
    ```
    authRouter.post("/login", async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const { accessToken } = await loginUser(email, password)

            res.status(200).json({
                success: true,
                message: "Login successful!",
                data: { accessToken }
            })

        } catch (error) {
            next(error)
        }
    })
    ```
- Test: POST /api/auth/login with body
    ```
    {
        "email": "test@example.com",
        "password": "123456"
    }
    ```


## Middlewares
1. Authentication Middleware
    - Why authentication middleware? Some routes (like /me) should be accessible only to logged-in users. The middleware runs before the route handler, verifies the access token sent by the client and attaches the logged-in user's data to req.user. If the token is missing/invalid, the request never reaches the route handler.
    - Flow
        ```
        Client Request (Authorization: Bearer <accessToken>)
                    │
                    ↓
            authenticate middleware
                    │
                    ├── No "Bearer" header ──→ next(AppError 401) ──→ errorHandler
                    │
                    ↓
            verifyAccessToken(token)
                    │
                    ├── Invalid/Expired ──→ throw AppError 401 ──→ errorHandler
                    │
                    ↓
            req.user = decoded payload
                    │
                    ↓
                next() ──→ Route handler
        ```

    ### Create verifyAccessToken function in src/lib/jwt.ts
    - jwt.verify checks the token signature using the same secret (env.jwtAccessSecret) that was used in signAccessToken and also checks the expiry
    - If valid - returns the decoded payload (userId, email, role)
    - If invalid or expired - jwt.verify throws error, we catch it and throw AppError with 401
        ```
        import { AppError } from "../errors/AppError";

        export const verifyAccessToken = (token: string): TokenPayload => {
            try {
                return jwt.verify(token, env.jwtAccessSecret) as TokenPayload
            } catch (error) {
                throw new AppError(401, "Invalid or expired access token.")
            }
        }
        ```

    ### Add/Append user type to Express Request object
    - By default, Express Request type does not have user property. So TypeScript will throw error on req.user = ...
    - Create express.d.ts in src/types/express.d.ts and extend the Request interface using declaration merging
        ```
        import { TokenPayload } from "./user";

        declare global {
            namespace Express {
                interface Request {
                    user?: TokenPayload
                }
            }
        }

        export {}
        ```
        - declare global -> modifies the global Express namespace instead of creating a new one
        - user?: -> optional because user is present only after authenticate middleware runs
        - export {} -> makes this file a module, which is required for declare global to work

    ### Create authenticate middleware in src/middlewares/auth.middleware.ts
    - Get the authorization header from req.headers
    - Check header starts with "Bearer " (with space) - if not, pass AppError 401 to next() and return
    - Extract the token from header - "Bearer <token>".split(" ")[1]
    - Verify the token using verifyAccessToken and attach the decoded payload to req.user
    - Call next() to move to the route handler
        ```
        import { NextFunction, Request, Response } from "express";
        import { AppError } from "../errors/AppError";
        import { verifyAccessToken } from "../lib/jwt";

        export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
            const authHeader = req.headers.authorization

            if(!authHeader?.startsWith("Bearer ")){
                next(new AppError(401, "Access Token is required"))
                return;
            }

            const token = authHeader.split(" ")[1]

            req.user = verifyAccessToken(token)

            next()
        }
        ```
        - Express 5 automatically catches the error thrown by verifyAccessToken (sync middleware) and forwards it to errorHandler

    ### Use authenticate middleware in a protected route - /me in src/routes/auth.routes.ts
    - Pass authenticate as second argument (before route handler) - it runs first for this route only
    - Inside handler, req.user is available with the logged-in user's data
        ```
        import { authenticate } from "../middlewares/auth.middleware";

        authRouter.get("/me", authenticate, async (req, res, next) => {
            try {
                res.status(200).json({
                    success: true,
                    data: {
                        user: req.user
                    }
                })
            } catch (error) {
                next(error)
            }
        })
        ```
    - Test: GET /api/auth/me with header
        ```
        Authorization: Bearer <accessToken received from /login>
        ```


## CRUD
- Why CRUD? CRUD = Create, Read, Update, Delete. These are the 4 basic operations on any resource. Here the resource is a support task (support_tasks table) and each task belongs to a logged-in user.
- All task routes are protected - only a logged-in user can work with tasks. The user id is taken from the access token (req.user), never from the request body - so a user can't create tasks for someone else.
- Layers used (see Folder Structure above): Route → Service → Repository → DB

### POST Request - Create Task
- Flow
    ```
    POST /api/tasks { title }
    (Authorization: Bearer <accessToken>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        POST "/" route (user.task.routes.ts)
                │
                ↓
        createUserTask(req.user.userId, title) (user.task.service.ts)
                │
                ↓
        validateTitle(title)
                │
                ├── not a string / empty ──→ AppError 400
                │
                ├── more than 150 characters ──→ AppError 400
                │
                ↓
        createTask(userId, trimmedTitle) (user.task.repository.ts)
                │
                ↓
        201 { success, data: { task } }
    ```

#### 1. Define task types in src/types/task.ts
- Task -> task data we return from functions
- TaskRow -> what we query from support_tasks table. Right now both are same, so TaskRow is just an alias of Task. Keeping separate names lets us change the DB row shape later without touching the rest of the code.
    ```
    export type Task = {
        id: string,
        title: string,
        status: string,
        user_id: string,
        created_at: string,
        updated_at: string
    }

    export type TaskRow = Task;
    ```

#### 2. Create createTask in src/repositories/user.task.repository.ts (DB related logic)
- Create createTask function. The function will return the created task
- Write query to insert the new task - `$1`, `$2` are parameterized values (prevents SQL injection)
- We only insert title & user_id. id, status ('OPEN'), created_at, updated_at get their DEFAULT values from the table (see 003_create_support_tasks_table.sql)
- `RETURNING` returns the inserted row, so no need of a separate SELECT query
    ```
    import { pool } from "../lib/db";
    import { TaskRow } from "../types/task";

    export const createTask = async(userId: string, title: string): Promise<TaskRow> => {
        const result = await pool.query<TaskRow>(
            `
            INSERT INTO support_tasks (title, user_id)
            VALUES ($1, $2)
            RETURNING id, title, status, user_id, created_at, updated_at
            `,
            [title, userId]
        )

        return result.rows[0];
    }
    ```

#### 3. Create createUserTask in src/services/user.task.service.ts (Business logic)
- Create validateTitle helper function
    - title is `unknown` because it comes directly from req.body - client can send anything (number, object, null...). So we first check it is a string.
    - Check title is not empty after trim - else 400
    - Check title length is not more than 150 characters - else 400
    - Return the trimmed title
- Create createUserTask function - validate the title and then call createTask from repository
    ```
    import { AppError } from "../errors/AppError"
    import { createTask } from "../repositories/user.task.repository";

    const validateTitle = (title: unknown): string => {
        if(typeof title !== 'string' || !title.trim()){
            throw new AppError(400, 'Valid title is required.')
        }

        const trimmedTitle = title.trim();

        if(trimmedTitle.length > 150){
            throw new AppError(400, 'Title must be less than 150 characters')
        }

        return trimmedTitle
    }

    export const createUserTask = async (userId: string, title: unknown) => {
        const validTitle = validateTitle(title)

        return createTask(userId, validTitle)
    }
    ```

#### 4. Create task route in src/routes/user.task.routes.ts
- `userTaskRouter.use(authenticate)` -> applies authenticate middleware to all routes of this router. No need to pass authenticate in each route (like we did for /me).
- post method with "/" path - final endpoint becomes /api/tasks (prefix is added in index.ts)
- Get userId from req.user (attached by authenticate middleware) and title from req.body
    - `req.user!` -> `!` (non-null assertion) tells TypeScript that req.user is definitely present. It is safe here because authenticate always runs before this handler.
- Call createUserTask and send response with status 201 (Created) with the created task
- Catch the error and pass it to errorHandler using next(error)
    ```
    import { Router } from 'express'
    import { authenticate } from '../middlewares/auth.middleware';
    import { createUserTask } from '../services/user.task.service';

    export const userTaskRouter = Router();

    userTaskRouter.use(authenticate)  // applies authenticate middleware to all routes of this router. No need to pass authenticate in each route

    userTaskRouter.post('/', async (req, res, next) => {
        try {
            const task = await createUserTask(req.user!.userId, req.body.title);

            res.status(201).json({
                success: true,
                data: {
                    task,
                },
            });
        } catch (error) {
            next(error);
        }
    });
    ```

#### 5. Provide the task route to root route in src/routes/index.ts
- All task routes get "/tasks" prefix → final endpoint becomes /api/tasks
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';
    import { authRouter } from './auth.routes';
    import { userTaskRouter } from './user.task.routes';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    apiRouter.use("/auth", authRouter)
    apiRouter.use("/tasks", userTaskRouter)
    ```
- Test: POST /api/tasks with header and body
    ```
    Authorization: Bearer <accessToken received from /login>
    ```
    ```
    {
        "title": "My first support task"
    }
    ```
- Response
    ```
    {
        "success": true,
        "data": {
            "task": {
                "id": "<uuid>",
                "title": "My first support task",
                "status": "OPEN",
                "user_id": "<logged-in user id>",
                "created_at": "...",
                "updated_at": "..."
            }
        }
    }
    ```

### GET Request - GET ALL Tasks by userId
- Why? A logged-in user should see only their own tasks. The userId is taken from the access token (req.user), so a user can never read another user's tasks.
- Flow
    ```
    GET /api/tasks
    (Authorization: Bearer <accessToken>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        GET "/" route (user.task.routes.ts)
                │
                ↓
        getUserTasks(req.user.userId) (user.task.service.ts)
                │
                ↓
        fetchTasksByUserId(userId) (user.task.repository.ts)
                │
                ↓
        200 { success, data: { tasks } }
    ```

#### 1. Create fetchTasksByUserId in src/repositories/user.task.repository.ts (DB related logic)
- Create fetchTasksByUserId function. The function will return an array of tasks (Task[])
- Write query to select all tasks of the user - `$1` is a parameterized value & `[userId]` provides the value for $1 (prevents SQL injection)
- `WHERE user_id = $1` -> only the logged-in user's tasks
- `ORDER BY created_at DESC` -> newest task first
- return `result.rows` -> all rows. If user has no tasks, it is an empty array `[]` (not null), so no need of `?? null` like findUserByEmail
    ```
    import { Task, TaskRow } from "../types/task";

    export const fetchTasksByUserId = async(userId: string): Promise<Task[]> => {
        const result = await pool.query<TaskRow>(
            `
            SELECT id, title, status, user_id, created_at, updated_at
            FROM support_tasks
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        )
        return result.rows
    }
    ```

#### 2. Create getUserTasks in src/services/user.task.service.ts (Business logic)
- No validation needed here - userId comes from the verified access token, not from the client
- Just call fetchTasksByUserId from repository. Still keep this service function, so the route never talks to the repository directly (Route → Service → Repository). Later business logic (filters, pagination etc.) can be added here without touching the route.
    ```
    import { createTask, fetchTasksByUserId } from "../repositories/user.task.repository";
    import { Task } from "../types/task";

    export const getUserTasks = async (userId: string): Promise<Task[]> => {
        return fetchTasksByUserId(userId)
    }
    ```

#### 3. Create get route in src/routes/user.task.routes.ts
- get method with "/" path - final endpoint becomes /api/tasks (same path as POST, but different HTTP method)
- authenticate already runs for this route because of `userTaskRouter.use(authenticate)` (added in POST Request)
- Get userId from req.user (`req.user!` - safe because authenticate runs before this handler)
- Call getUserTasks and send response with status 200 (OK) with the tasks
- Catch the error and pass it to errorHandler using next(error)
    ```
    import { createUserTask, getUserTasks } from '../services/user.task.service';

    userTaskRouter.get('/', async (req, res, next) => {
        try {
            const tasks = await getUserTasks(req.user!.userId);

            res.status(200).json({
                success: true,
                data: {tasks}
            })
        } catch (error) {
            next(error)
        }
    })
    ```
- No change needed in src/routes/index.ts - userTaskRouter is already plugged with "/tasks" prefix
- Test: GET /api/tasks with header
    ```
    Authorization: Bearer <accessToken received from /login>
    ```
- Response
    ```
    {
        "success": true,
        "data": {
            "tasks": [
                {
                    "id": "<uuid>",
                    "title": "My second support task",
                    "status": "OPEN",
                    "user_id": "<logged-in user id>",
                    "created_at": "...",
                    "updated_at": "..."
                },
                {
                    "id": "<uuid>",
                    "title": "My first support task",
                    "status": "OPEN",
                    "user_id": "<logged-in user id>",
                    "created_at": "...",
                    "updated_at": "..."
                }
            ]
        }
    }
    ```


### GET Request - GET individual Task by taskId & userId
- Why? A logged-in user should be able to open a single task by its id. We check both taskId and userId in the query, so a user can only read their own task. If the task belongs to someone else, it is treated as "not found" (404) - so the user can't even find out that the task exists.
- Flow
    ```
    GET /api/tasks/:taskId
    (Authorization: Bearer <accessToken>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        GET "/:taskId" route (user.task.routes.ts)
                │
                ↓
        getUserTaskById(req.user.userId, req.params.taskId) (user.task.service.ts)
                │
                ↓
        validateTaskId(taskId) (task.validator.ts)
                │
                ├── not a valid UUID ──→ AppError 400
                │
                ↓
        fetchTaskByTaskId(taskId, userId) (user.task.repository.ts)
                │
                ├── task not found / belongs to another user ──→ AppError 404
                │
                ↓
        200 { success, data: { task } }
    ```

#### 1. Create fetchTaskByTaskId in src/repositories/user.task.repository.ts (DB related logic)
- Create fetchTaskByTaskId function. The function will return a task (if found) or null (if not found)
- Write query to select one task - `$1`, `$2` are parameterized values & `[taskId, userId]` provides the values (prevents SQL injection)
- `WHERE id = $1 AND user_id = $2` -> task must match the id AND belong to the logged-in user. Without `user_id = $2`, any logged-in user could read any task just by knowing its id.
- return the result - first row if found, else null (same as findUserByEmail)
    ```
    export const fetchTaskByTaskId = async(taskId: string, userId: string): Promise<Task | null> => {
        const result = await pool.query<TaskRow>(
            `
            SELECT id, title, status, user_id, created_at, updated_at
            FROM support_tasks
            WHERE  id = $1  AND user_id = $2
            `,
            [taskId, userId]
        )

        return result.rows[0] ?? null
    }
    ```

#### 2. Create validateTaskId in src/validators/task.validator.ts
- Why? id column of support_tasks is UUID type. If client sends something like "abc" in the URL, Postgres throws error `invalid input syntax for type uuid` → errorHandler treats it as unknown error → 500 Internal Server Error. But it is the client's mistake, so it should be 400 (Bad Request).
- So we check taskId format using a UUID regex before hitting the DB - if it doesn't match, throw AppError 400
- UUID format: 8-4-4-4-12 hex characters, e.g. `3f2a1b4c-9d8e-4f7a-b6c5-1a2b3c4d5e6f`. `i` flag -> case-insensitive (A-F or a-f both allowed)
- Why a separate validators file and not inside user.task.service.ts? Every route with `:taskId` in the URL needs this check - GET by id, PATCH, DELETE, and later the admin routes too. Keeping it in its own file means any service can import it, instead of one service importing from another or copy-pasting the same code (2 copies = 2 places to fix if the rule changes).
- validateTaskId is exported (services use it), UUID_REGEX is NOT exported (only validateTaskId needs it)
    ```
    import { AppError } from "../errors/AppError";

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    export const validateTaskId = (taskId: string): void => {
        if (!UUID_REGEX.test(taskId)) {
            throw new AppError(400, 'Invalid task id.')
        }
    }
    ```

#### 3. Create getUserTaskById in src/services/user.task.service.ts (Business logic)
- Create getUserTaskById function
    - Validate taskId using validateTaskId (import from validators) - else 400
    - Call fetchTaskByTaskId from repository
    - If task is null (not found or belongs to another user) - throw AppError 404 (Not Found)
    - Return the task
    ```
    import { createTask, fetchTaskByTaskId, fetchTasksByUserId } from "../repositories/user.task.repository";
    import { validateTaskId } from "../validators/task.validator";

    export const getUserTaskById = async (userId: string, taskId: string): Promise<Task | null> => {
        validateTaskId(taskId)

        const task = await fetchTaskByTaskId(taskId, userId)
        
        if(!task){
            throw new AppError(404, 'Task not found!')
        }
        
        return task;
    }
    ```
    - Note: Order of arguments - service takes (userId, taskId) but repository takes (taskId, userId). Pass them in the correct order.

#### 4. Create get by id route in src/routes/user.task.routes.ts
- get method with "/:taskId" path - final endpoint becomes /api/tasks/:taskId
    - `:taskId` is a route parameter - Express reads the value from the URL and puts it in `req.params.taskId`
    - e.g. GET /api/tasks/abc-123 → req.params.taskId = "abc-123"
- authenticate already runs for this route because of `userTaskRouter.use(authenticate)` (added in POST Request)
- Get userId from req.user (`req.user!` - safe because authenticate runs before this handler) and taskId from req.params
- Call getUserTaskById and send response with status 200 (OK) with the task
- Catch the error (e.g. AppError 404) and pass it to errorHandler using next(error)
    ```
    import { createUserTask, getUserTaskById, getUserTasks } from '../services/user.task.service';

    userTaskRouter.get('/:taskId', async(req, res, next) => {
        try {
            const task = await getUserTaskById(req.user!.userId, req.params.taskId)

            res.status(200).json({
                success: true,
                data: { task }
            })
        } catch (error) {
            next(error)
        }
    })
    ```
- No change needed in src/routes/index.ts - userTaskRouter is already plugged with "/tasks" prefix
- Test: GET /api/tasks/<taskId> with header
    ```
    Authorization: Bearer <accessToken received from /login>
    ```
- Response
    ```
    {
        "success": true,
        "data": {
            "task": {
                "id": "<taskId>",
                "title": "My first support task",
                "status": "OPEN",
                "user_id": "<logged-in user id>",
                "created_at": "...",
                "updated_at": "..."
            }
        }
    }
    ```
- Response - when task is not found or belongs to another user (404)
    ```
    {
        "success": false,
        "message": "Task not found!"
    }
    ```
- Response - when taskId is not a valid UUID, e.g. GET /api/tasks/abc (400)
    ```
    {
        "success": false,
        "message": "Invalid task id."
    }
    ```


### PATCH Request - Update Task Title and/or Status
- Why? A logged-in user should be able to change the title and/or status of their own task (e.g. OPEN → IN PROGRESS → RESOLVED). Same as GET by id, we check both taskId and userId in the query, so a user can only update their own task.
- PATCH vs PUT
    - PUT -> replaces the whole resource. Client must send ALL fields.
    - PATCH -> partial update. Client sends ONLY the fields it wants to change, other fields stay the same.
    - So here the client can send only title, only status, or both. id, user_id, created_at never change.
    ```
    { "status": "RESOLVED" }                      → only status is updated, title stays same
    { "title": "New title" }                      → only title is updated, status stays same
    { "title": "New title", "status": "OPEN" }    → both are updated
    {}                                            → 400 (nothing to update)
    ```
- Flow
    ```
    PATCH /api/tasks/:taskId { title?, status? }
    (Authorization: Bearer <accessToken>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        PATCH "/:taskId" route (user.task.routes.ts)
                │
                ↓
        updateUserTask(req.params.taskId, req.user.userId, title, status) (user.task.service.ts)
                │
                ↓
        validateTaskId(taskId) (task.validator.ts)
                │
                ├── not a valid UUID ──→ AppError 400
                │
                ↓
        title & status both not sent?
                │
                ├── yes (empty body) ──→ AppError 400
                │
                ↓
        title sent? → validateTitle(title)
                │
                ├── not a string / empty ──→ AppError 400
                │
                ├── more than 150 characters ──→ AppError 400
                │
                ↓
        status sent? → validateStatus(status)
                │
                ├── not one of OPEN / IN PROGRESS / RESOLVED ──→ AppError 400
                │
                ↓
        updateTaskByPatch(taskId, userId, validTitle, validStatus) (user.task.repository.ts)
                │
                ├── task not found / belongs to another user ──→ AppError 404
                │
                ↓
        200 { success, data: { task } }
    ```

#### 1. Create updateTaskByPatch in src/repositories/user.task.repository.ts (DB related logic)
- Create updateTaskByPatch function. The function will return the updated task (if found) or null (if not found)
- `title?: string, status?: string` -> both are optional. If the client didn't send a field, the service passes `undefined`.
- Problem: how to write ONE UPDATE query, when we don't know which fields will be sent? There are 2 ways:

##### Option A - COALESCE (used in the project)
- Query stays fixed. For the field that was not sent, we pass `null` and `COALESCE` keeps the current value of the column.
- `COALESCE(a, b)` -> returns the first value that is not null
    - `COALESCE($1, title)` -> if $1 has a value, use it. If $1 is null, use the current `title` (i.e. no change)
    ```
    COALESCE('New title', title)   → 'New title'   (updated)
    COALESCE(NULL, title)          → title         (same as before)
    ```
- `[title ?? null, status ?? null, taskId, userId]` -> `undefined` is converted to `null`, so COALESCE can fall back to the current value
- `updated_at = NOW()` -> updated_at has DEFAULT NOW() only for INSERT. On UPDATE, Postgres doesn't change it automatically, so we set it manually.
- `WHERE id = $3 AND user_id = $4` -> update only if the task matches the id AND belongs to the logged-in user. If not, no row is updated and `result.rows` is an empty array.
- `RETURNING` returns the updated row, so no need of a separate SELECT query
- return the result - updated row if found, else null (same as fetchTaskByTaskId)
    - Why `?? null`? If no row is updated, `result.rows[0]` is `undefined`. The return type says `Task | null`, so we convert `undefined` to `null` to keep it consistent with other repository functions.
    ```
    // Option A - COALESCE: fields not sent are passed as null, and COALESCE($n, column) keeps the current value
    export const updateTaskByPatch = async (taskId: string, userId: string, title?: string, status?: string): Promise<Task | null> => {
        const result = await pool.query<TaskRow>(
            `
            UPDATE support_tasks
            SET title = COALESCE($1, title),
                status = COALESCE($2, status),
                updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            RETURNING id, title, status, user_id, created_at, updated_at
            `,
            [title ?? null, status ?? null, taskId, userId]
        )

        return result.rows[0] ?? null
    }
    ```
- Pros: Simple, one fixed query, easy to read.
- Cons: We can never set a column TO null using this (because null means "keep the old value"). It is fine here because title & status are both NOT NULL.

##### Option B - Dynamic SET clause (kept commented out in the repository for reference)
- Build the SET clause in JS - add `column = $n` only for the fields that were sent.
- `values` array holds the parameter values. `$${values.length}` -> after push, the length gives the next placeholder number ($1, $2...)
    - `$$` inside a template string -> first `$` is the literal `$` character, then `${...}` is the JS expression. So `` `title = $${values.length}` `` becomes `title = $1`
- taskId & userId are pushed at the end, so their placeholders are always the last two: `$${values.length - 1}` and `$${values.length}`
- e.g. only status sent → `SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3` with values `[status, taskId, userId]`
- Column names (`title`, `status`) are hardcoded in our code. NEVER build column names from `req.body` keys - that would allow SQL injection through column names. Only values go through `$n` placeholders.
    ```
    export const updateTaskByPatch = async (taskId: string, userId: string, title?: string, status?: string): Promise<Task | null> => {
        const fields: string[] = []
        const values: unknown[] = []

        if (title !== undefined) {
            values.push(title)
            fields.push(`title = $${values.length}`)
        }

        if (status !== undefined) {
            values.push(status)
            fields.push(`status = $${values.length}`)
        }

        values.push(taskId, userId)

        const result = await pool.query<TaskRow>(
            `
            UPDATE support_tasks
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${values.length - 1} AND user_id = $${values.length}
            RETURNING id, title, status, user_id, created_at, updated_at
            `,
            values
        )

        return result.rows[0] ?? null
    }
    ```
- Pros: Scales well for tables with many optional fields. Can also set a nullable column to null.
- Cons: More code, harder to read.
- Both options have the same name & signature, so to switch - comment out Option A and uncomment Option B. No change needed in service or route.

#### 2. Create updateUserTask in src/services/user.task.service.ts (Business logic)
- Create validateStatus helper function
    - Why? status column has a CHECK constraint - only 'OPEN', 'IN PROGRESS', 'RESOLVED' are allowed (see 003_create_support_tasks_table.sql). If client sends "DONE", Postgres throws error → errorHandler treats it as unknown error → 500. But it is the client's mistake, so it should be 400 (same reason as validateTaskId).
    - status is `unknown` because it comes directly from req.body (same as title in validateTitle). So we first check it is a string.
    - `TASK_STATUSES.includes(status)` -> checks status is one of the allowed values - else 400
    - Return the valid status
    ```
    const TASK_STATUSES = ['OPEN', 'IN PROGRESS', 'RESOLVED']

    const validateStatus = (status: unknown): string => {
        if (typeof status !== 'string' || !TASK_STATUSES.includes(status)) {
            throw new AppError(400, 'Invalid task status.')
        }

        return status
    }
    ```
    - Common mistake: `if(status != 'OPEN' || status != 'IN PROGRESS' || status != 'RESOLVED')` -> this is ALWAYS true, because any value is "not equal" to at least two of the three. So it rejects every status, even valid ones. Correct logic needs `&&` (not this AND not this AND not this) - or simply use `includes` like above.
- Create updateUserTask function
    - `title?: unknown, status?: unknown` -> optional (client may not send them) and unknown (they come directly from req.body, so can be any type)
    - Validate taskId using validateTaskId (same one used in getUserTaskById) - else 400
    - If both title and status are not sent (empty body `{}`) - throw AppError 400. Without this check, `{}` would only change updated_at and return 200, which is misleading.
    - Validate only the fields that were sent
        - `title !== undefined ? validateTitle(title) : undefined` -> if title was sent, validate it. Else keep it undefined (repository will not change it).
        - Use `!== undefined`, NOT `if(title)`. With `if(title)`, an empty string `""` is falsy, so it would be silently skipped instead of being rejected with 400.
        - `null` is not `undefined`, so `{ "title": null }` goes to validateTitle and gets 400 (title can't be null)
    - Call updateTaskByPatch from repository with validTitle & validStatus
        - `await` is important here. Without `await`, task is a Promise (not the row). A Promise is always truthy, so `if(!task)` never runs and 404 is never thrown.
    - If task is null (not found or belongs to another user) - throw AppError 404 (Not Found)
    - Return the updated task
    ```
    import { createTask, fetchTaskByTaskId, fetchTasksByUserId, updateTaskByPatch } from "../repositories/user.task.repository";

    export const updateUserTask = async (taskId: string, userId: string, title?: unknown, status?: unknown): Promise<Task | null> => {

        validateTaskId(taskId)

        if (title === undefined && status === undefined) {
            throw new AppError(400, 'At least one field (title or status) is required.')
        }

        const validTitle = title !== undefined ? validateTitle(title) : undefined

        const validStatus = status !== undefined ? validateStatus(status) : undefined

        const task = await updateTaskByPatch(taskId, userId, validTitle, validStatus)

        if (!task) {
            throw new AppError(404, 'Task not found')
        }

        return task
    }
    ```
    - Note: Order of arguments - here both service and repository take (taskId, userId, ...). This is different from getUserTaskById which takes (userId, taskId).

#### 3. Create patch route in src/routes/user.task.routes.ts
- patch method with "/:taskId" path - final endpoint becomes /api/tasks/:taskId (same path as GET by id, but different HTTP method)
- authenticate already runs for this route because of `userTaskRouter.use(authenticate)` (added in POST Request)
- Get taskId from req.params, userId from req.user (`req.user!` - safe because authenticate runs before this handler), title & status from req.body
    - If client doesn't send a field, `req.body.title` / `req.body.status` is `undefined` - so the route passes it as it is and the service decides what to do
- Call updateUserTask and send response with status 200 (OK) with the updated task
- Catch the error (e.g. AppError 400/404) and pass it to errorHandler using next(error)
    ```
    import { createUserTask, getUserTaskById, getUserTasks, updateUserTask } from '../services/user.task.service';

    userTaskRouter.patch('/:taskId', async(req, res, next) => {
        try {
            const task = await updateUserTask(
                req.params.taskId,
                req.user!.userId,
                req.body.title,
                req.body.status
            )

            res.status(200).json({
                success: true,
                data: { task }
            })
        } catch (error) {
            next(error)
        }
    })
    ```
- No change needed in src/routes/index.ts - userTaskRouter is already plugged with "/tasks" prefix
- Test: PATCH /api/tasks/<taskId> with header and body
    ```
    Authorization: Bearer <accessToken received from /login>
    ```
    ```
    {
        "status": "IN PROGRESS"
    }
    ```
- Response - only status is changed, title stays the same
    ```
    {
        "success": true,
        "data": {
            "task": {
                "id": "<taskId>",
                "title": "My first support task",
                "status": "IN PROGRESS",
                "user_id": "<logged-in user id>",
                "created_at": "...",
                "updated_at": "<new time>"
            }
        }
    }
    ```
- Response - when body is empty `{}` (400)
    ```
    {
        "success": false,
        "message": "At least one field (title or status) is required."
    }
    ```
- Response - when title is sent but empty/invalid, e.g. "title": "" (400)
    ```
    {
        "success": false,
        "message": "Valid title is required."
    }
    ```
- Response - when status is sent but not one of OPEN / IN PROGRESS / RESOLVED, e.g. "status": "DONE" (400)
    ```
    {
        "success": false,
        "message": "Invalid task status."
    }
    ```
- Response - when taskId is not a valid UUID, e.g. PATCH /api/tasks/abc (400)
    ```
    {
        "success": false,
        "message": "Invalid task id."
    }
    ```
- Response - when task is not found or belongs to another user (404)
    ```
    {
        "success": false,
        "message": "Task not found"
    }
    ```


### DELETE request - Delete Task
- Why? A logged-in user should be able to delete their own task. Same as GET by id & PATCH, we check both taskId and userId in the query, so a user can only delete their own task. If the task belongs to someone else, it is treated as "not found" (404).
- Flow
    ```
    DELETE /api/tasks/:taskId
    (Authorization: Bearer <accessToken>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        DELETE "/:taskId" route (user.task.routes.ts)
                │
                ↓
        deleteUserTask(req.params.taskId, req.user.userId) (user.task.service.ts)
                │
                ↓
        validateTaskId(taskId) (task.validator.ts)
                │
                ├── not a valid UUID ──→ AppError 400
                │
                ↓
        deleteTask(taskId, userId) (user.task.repository.ts)
                │
                ├── no row deleted (not found / belongs to another user) ──→ AppError 404
                │
                ↓
        200 { success, message }
    ```

#### 1. Create deleteTask in src/repositories/user.task.repository.ts (DB related logic)
- Create deleteTask function. The function will return `true` (if task was deleted) or `false` (if no task was deleted)
- Write query to delete one task - `$1`, `$2` are parameterized values & `[taskId, userId]` provides the values (prevents SQL injection)
- `WHERE id = $1 AND user_id = $2` -> delete only if the task matches the id AND belongs to the logged-in user. Without `user_id = $2`, any logged-in user could delete any task just by knowing its id.
- No `RETURNING` here - we don't need the deleted row back, we only need to know whether something was deleted
- `result.rowCount` -> number of rows affected by the query (for DELETE - number of rows deleted)
    - task found & deleted → rowCount = 1 → return true
    - task not found / belongs to another user → rowCount = 0 → return false
    - Why `?? 0`? In pg types, rowCount is `number | null`, so we convert null to 0 before comparing
    ```
    export const deleteTask = async(taskId: string, userId: string): Promise<boolean> => {
        const result = await pool.query(
            `
            DELETE FROM support_tasks
            WHERE id = $1 AND user_id = $2
            `,
            [taskId, userId]
        )

        return (result.rowCount ?? 0 ) > 0;
    }
    ```
- Note: `pool.query` has no `<TaskRow>` generic here, because DELETE without RETURNING returns no rows

#### 2. Create deleteUserTask in src/services/user.task.service.ts (Business logic)
- Validate taskId using validateTaskId (same one used in getUserTaskById & updateUserTask) - else 400
- Call deleteTask from repository
    - `await` is important here. Without `await`, deletedTask is a Promise (not a boolean). A Promise is always truthy, so `if(!deletedTask)` never runs and 404 is never thrown.
- If deletedTask is false (not found or belongs to another user) - throw AppError 404 (Not Found)
- Return type is `Promise<void>` - nothing to return. If no error is thrown, it means the task was deleted.
    ```
    import { createTask, deleteTask, fetchTaskByTaskId, fetchTasksByUserId, updateTaskByPatch } from "../repositories/user.task.repository";

    export const deleteUserTask = async (taskId: string, userId: string): Promise<void> => {
        validateTaskId(taskId);

        const deletedTask = await deleteTask(taskId, userId)

        if(!deletedTask){
            throw new AppError(404, "Task not found.")
        }
    }
    ```
    - Note: Order of arguments - here both service and repository take (taskId, userId), same as updateUserTask.

#### 3. Create delete route in src/routes/user.task.routes.ts
- delete method with "/:taskId" path - final endpoint becomes /api/tasks/:taskId (same path as GET by id & PATCH, but different HTTP method)
- authenticate already runs for this route because of `userTaskRouter.use(authenticate)` (added in POST Request)
- Get taskId from req.params and userId from req.user (`req.user!` - safe because authenticate runs before this handler)
- Call deleteUserTask and send response with status 200 (OK) with a success message
    - There is no task to send back (it is deleted), so we send only a message
    - Alternative: status 204 (No Content) with `res.status(204).send()` - also common for DELETE, but 204 can't have a response body. We use 200 so that the client gets a message.
- Catch the error (e.g. AppError 400/404) and pass it to errorHandler using next(error)
    ```
    import { createUserTask, deleteUserTask, getUserTaskById, getUserTasks, updateUserTask } from '../services/user.task.service';

    userTaskRouter.delete('/:taskId', async (req, res, next) => {
        try {
            await deleteUserTask(req.params.taskId, req.user!.userId)

            res.status(200).json({
                success: true,
                message: `Task ${req.params.taskId} is deleted successfully.`
            })
        } catch (error) {
            next(error)
        }
    })
    ```
    - Note: deleteUserTask returns `void`, so there is no need to store its result in a variable (e.g. `const task = await ...`) - just `await` it.
- No change needed in src/routes/index.ts - userTaskRouter is already plugged with "/tasks" prefix
- Test: DELETE /api/tasks/<taskId> with header (no body needed)
    ```
    Authorization: Bearer <accessToken received from /login>
    ```
- Response
    ```
    {
        "success": true,
        "message": "Task <taskId> is deleted successfully."
    }
    ```
- Response - when task is not found, belongs to another user, or is already deleted (404)
    ```
    {
        "success": false,
        "message": "Task not found."
    }
    ```
- Response - when taskId is not a valid UUID, e.g. DELETE /api/tasks/abc (400)
    ```
    {
        "success": false,
        "message": "Invalid task id."
    }
    ```


## Admin + Search/Filters
- Why? A normal user sees only their own tasks (GET /api/tasks). An ADMIN should see ALL tasks of ALL users, and should be able to filter them:
    - search -> tasks whose title contains some text (case-insensitive)
    - status -> tasks with a given status (OPEN / IN PROGRESS / RESOLVED)
- Filters come from the URL query string (the part after `?`), NOT from the body. GET requests don't have a body.
    ```
    GET /api/admin/tasks                              → all tasks
    GET /api/admin/tasks?search=login                 → title contains "login"
    GET /api/admin/tasks?status=open                  → only OPEN tasks
    GET /api/admin/tasks?search=login&status=open     → title contains "login" AND status is OPEN
    ```
- Only users with role 'ADMIN' can call this route. role column of users table has DEFAULT 'USER' (see 002_create_user_table.sql), so to test, make a user admin manually in DB:
    ```
    UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
    ```
    - Login again after this - role is stored inside the JWT, so the old token still has role 'USER'
- Flow
    ```
    GET /api/admin/tasks?search=...&status=...
    (Authorization: Bearer <accessToken>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        requireAdmin middleware (admin.middleware.ts)
                │
                ├── req.user.role is not 'ADMIN' ──→ AppError 403
                │
                ↓
        GET "/" route (admin.task.routes.ts)
                │
                ├── search/status is not a single string (e.g. array) ──→ AppError 400
                │
                ↓
        getAdminTasks({ search, status }) (admin.task.service.ts)
                │
                ↓
        clean values (trim, uppercase status, "" → undefined)
                │
                ├── status not one of OPEN / IN PROGRESS / RESOLVED ──→ AppError 400
                │
                ↓
        findAllTasks({ search, status }) (admin.task.repository.ts)
                │
                ↓
        build WHERE clause only for the filters that were sent
                │
                ↓
        200 { success, data: { tasks } }
    ```

### 1. TASK_STATUSES in src/types/task.ts (shared by user & admin service)
-   ```
    export const TASK_STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED"] as const;
    export type TaskStatus = (typeof TASK_STATUSES)[number]
    ```
- Line 1 - `as const`
    - Without `as const`, TypeScript sees the array as `string[]` - "an array of any strings". It forgets the exact values.
    - With `as const`, TypeScript remembers the exact values and makes the array readonly (can't push/change it):
    ```
    ["OPEN", "IN PROGRESS", "RESOLVED"]            → type: string[]
    ["OPEN", "IN PROGRESS", "RESOLVED"] as const   → type: readonly ["OPEN", "IN PROGRESS", "RESOLVED"]
    ```
- Line 2 - `(typeof TASK_STATUSES)[number]` - read it in 2 steps
    - Step 1: `typeof TASK_STATUSES` -> "give me the TYPE of this variable" → `readonly ["OPEN", "IN PROGRESS", "RESOLVED"]`
    - Step 2: `[number]` -> "what type do I get if I read this array at ANY number index (0, 1, 2...)?" → any one of its items
    - Result:
    ```
    type TaskStatus = "OPEN" | "IN PROGRESS" | "RESOLVED"
    ```
    - It is the same as writing that union by hand, but now the values are written only ONCE. If we add a new status (e.g. "CLOSED") to the array, TaskStatus updates automatically.
    - This only works because of `as const`. Without it, `(typeof TASK_STATUSES)[number]` would just be `string`.
- Why `status as TaskStatus` when calling includes?
    - `TASK_STATUSES.includes(x)` now expects x to be a `TaskStatus`, but status is a plain `string`. TypeScript complains: "string is not assignable to TaskStatus".
    - `as TaskStatus` tells TypeScript "trust me, treat it as TaskStatus" - it is safe here because includes() is exactly the runtime check that tells us whether it really is one.
- Update validateStatus in user.task.service.ts to import from types
    ```
    import { Task, TASK_STATUSES, TaskStatus } from "../types/task";

    const validateStatus = (status: unknown): string => {
        if (typeof status !== 'string' || !TASK_STATUSES.includes(status as TaskStatus)) {
            throw new AppError(400, 'Invalid task status.')
        }

        return status
    }
    ```

### 2. Define admin types in src/types/admin.ts
- AdminTaskListQuery -> what the route sends to the service (raw values from req.query)
- AdminTaskListFilters -> what the service sends to the repository (cleaned & validated values)
- AdminTaskListResponse -> what the service returns
- Both query & filters are optional (`?`) - client may send none, one or both. Right now Query and Filters look the same, but keeping separate names makes it clear which one is raw and which one is cleaned (same idea as Task & TaskRow).
    ```
    import { Task } from "./task"

    export type AdminTaskListResponse = {
        tasks: Task[]
    }

    export type AdminTaskListQuery = {
        search?: string,
        status?: string
    }

    export type AdminTaskListFilters = {
        search?: string,
        status?: string
    }
    ```

### 3. Create findAllTasks in src/repositories/admin.task.repository.ts (DB related logic)
- Create findAllTasks function. The function will return an array of tasks (Task[]) - an empty array `[]` if nothing matches
- No `WHERE user_id = ...` here - admin sees tasks of all users
- Problem: the WHERE part depends on which filters were sent. We have 4 cases:
    ```
    nothing sent          → (no WHERE)
    only search           → WHERE title ILIKE $1
    only status           → WHERE status = $1
    search + status       → WHERE title ILIKE $1 AND status = $2
    ```
- So we can't write one fixed query. We BUILD the WHERE part in JS - same idea as Option B (Dynamic SET clause) in PATCH.

#### 3.1 The 3 helper variables (lines 6-10)
- Code
    ```
    const conditions: string[] = []   // pieces of SQL, e.g. "title ILIKE $1"
    const values: unknown[] = []      // the actual values for $1, $2...
    let paramIndex = 1;               // the next placeholder number to use
    ```
- Think of it as 2 lists that always grow together:
    - conditions -> what to check (SQL text with placeholder)
    - values -> the value for that placeholder
    - conditions[0] uses $1 → its value is values[0], conditions[1] uses $2 → its value is values[1]
- paramIndex -> keeps track of the next number. Starts at 1 (Postgres placeholders start at $1, not $0). After using a number we do `paramIndex++`.
- `$${paramIndex}` -> first `$` is the literal `$` character, then `${paramIndex}` is the JS value. So `` `status = $${paramIndex}` `` becomes `status = $1` (same as in PATCH Option B)

#### 3.2 search filter (lines 12-18)
- Code
    ```
    if(filters.search){
        conditions.push(`title ILIKE $${paramIndex}`)
        // Escape \, % and _ so they are matched literally instead of acting as ILIKE wildcards
        const escapedSearch = filters.search.replace(/[\\%_]/g, "\\$&")
        values.push(`%${escapedSearch}%`)
        paramIndex++
    }
    ```
- `ILIKE` -> same as `LIKE` but case-insensitive. So "login", "LOGIN", "Login" all match.
- In LIKE/ILIKE, 2 characters have special meaning (wildcards):
    - `%` -> any number of characters (0 or more)
    - `_` -> exactly one character
- `%${escapedSearch}%` -> `%` on both sides means "title CONTAINS this text anywhere"
    ```
    search = "login"   →  value = "%login%"
    matches: "login bug", "Cannot LOGIN", "fix login page"
    ```
- Why escape? If the user's search text itself contains `%` or `_`, Postgres treats it as a wildcard, not as a normal character:
    ```
    search = "%"       →  "%%%"     → matches EVERY title (wrong)
    search = "50%"     →  "%50%%"   → matches "50", "500", "5000 users" (wrong)
    search = "a_b"     →  "%a_b%"   → matches "a_b" but also "axb", "a b" (wrong)
    ```
- `.replace(/[\\%_]/g, "\\$&")` -> put a backslash `\` before every `\`, `%` and `_`. In LIKE, `\` is the default escape character, so `\%` means "a real % character".
    - `/[\\%_]/` -> regex that matches one character: `\` or `%` or `_`. (`\\` in regex = one real backslash)
    - `g` -> global - replace ALL matches, not only the first one
    - `"\\$&"` -> the replacement. `\\` in a JS string = one real `\`. `$&` = "the character that was matched". So `%` becomes `\%`, `_` becomes `\_`
    - We escape `\` also, because otherwise a backslash typed by the user would escape the next character
    ```
    search = "50%"     →  escaped "50\%"    →  value "%50\%%"    → only titles containing "50%"
    search = "a_b"     →  escaped "a\_b"    →  value "%a\_b%"    → only titles containing "a_b"
    ```
- Note: This is NOT about SQL injection - the value still goes through `$1`, so it is already safe. Escaping only makes the search results correct.

#### 3.3 status filter (lines 19-23)
- Code
    ```
    if(filters.status){
        conditions.push(`status = $${paramIndex}`)
        values.push(filters.status)
        paramIndex++
    }
    ```
- Exact match - no wildcards needed. Service already checked it is one of OPEN / IN PROGRESS / RESOLVED.
- If search was also sent, paramIndex is already 2 here, so this becomes `status = $2`. If search was not sent, it becomes `status = $1`. That is why we use paramIndex instead of hardcoding numbers.

#### 3.4 Build the WHERE clause (line 25)
- Code
    ```
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    ```
- If there is at least one condition → join them with " AND " and put "WHERE" in front
- If there are no conditions → empty string (no WHERE at all → all tasks)
- `join(" AND ")` -> joins array items with " AND " in between. With 1 item, no AND is added.
    ```
    conditions = []                                       →  ""
    conditions = ["status = $1"]                          →  "WHERE status = $1"
    conditions = ["title ILIKE $1", "status = $2"]        →  "WHERE title ILIKE $1 AND status = $2"
    ```

#### 3.5 Run the query (lines 27-36)
- Put whereClause inside the query using `${whereClause}` and pass the values array
    ```
    import { pool } from "../lib/db";
    import { AdminTaskListFilters } from "../types/admin";
    import { Task, TaskRow } from "../types/task";

    export const findAllTasks = async (filters: AdminTaskListFilters): Promise<Task[]> => {
        const conditions: string[] = []

        const values: unknown[] = []

        let paramIndex = 1;

        if(filters.search){
            conditions.push(`title ILIKE $${paramIndex}`)
            // Escape \, % and _ so they are matched literally instead of acting as ILIKE wildcards
            const escapedSearch = filters.search.replace(/[\\%_]/g, "\\$&")
            values.push(`%${escapedSearch}%`)
            paramIndex++
        }
        if(filters.status){
            conditions.push(`status = $${paramIndex}`)
            values.push(filters.status)
            paramIndex++
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

        const result = await pool.query<TaskRow>(
            `
            SELECT id, title, status, user_id, created_at, updated_at
            FROM support_tasks
            ${whereClause} 
            ORDER BY created_at DESC
            `,
            values
        )
        return result.rows;
    }
    ```
- Full example - `?search=login&status=open`
    ```
    conditions = ["title ILIKE $1", "status = $2"]
    values     = ["%login%", "OPEN"]

    Final SQL:
    SELECT id, title, status, user_id, created_at, updated_at
    FROM support_tasks
    WHERE title ILIKE $1 AND status = $2
    ORDER BY created_at DESC
    ```
- Is `${whereClause}` safe? We put a JS string directly into SQL, but whereClause contains ONLY text written by us ("title ILIKE $1", "status = $2"). The user's values never go into the SQL text - they go only into the `values` array → `$1`, `$2`. So no SQL injection.

### 4. Create getAdminTasks in src/services/admin.task.service.ts (Business logic)
- Clean the raw values, validate status, then call findAllTasks from repository
    ```
    import { AppError } from "../errors/AppError";
    import { findAllTasks } from "../repositories/admin.task.repository";
    import { AdminTaskListQuery, AdminTaskListResponse } from "../types/admin";
    import { TASK_STATUSES, TaskStatus } from "../types/task";

    export const getAdminTasks = async (query: AdminTaskListQuery): Promise<AdminTaskListResponse> => {
        const search = query.search?.trim() || undefined
        const status = query.status?.toUpperCase().trim() || undefined

        if (status && !TASK_STATUSES.includes(status as TaskStatus)) {
            throw new AppError(400, 'Status must be one of Open, In Progress or Resolved')
        }

        const tasks = await findAllTasks({ search, status })

        return { tasks }
    }
    ```

#### 4.1 Cleaning search & status (lines 8-9) - read from left to right
- Code
    ```
    const search = query.search?.trim() || undefined
    const status = query.status?.toUpperCase().trim() || undefined
    ```
- `?.` (optional chaining) -> if query.search is undefined (not sent), STOP and give undefined, instead of crashing with "Cannot read properties of undefined (reading 'trim')". It stops the whole chain, so `.toUpperCase().trim()` are also skipped.
- `.trim()` -> remove spaces at start & end. "  login " → "login"
- `.toUpperCase()` (only for status) -> client can send "open", "Open", "OPEN" - all become "OPEN". DB stores uppercase, so this makes the API friendly.
- `|| undefined` -> if the result is an empty string `""`, change it to undefined
    - `""` is falsy, so `"" || undefined` → undefined
    - Why? `?search=` or `?search=%20%20` (only spaces) means "no search really". If we keep `""`, it is still "sent" in our code. With undefined, the repository's `if(filters.search)` skips it → no filter.
- What we get for different inputs
    ```
    URL                         query.status      status (after cleaning)
    (not sent)                  undefined         undefined     → no status filter
    ?status=                    ""                undefined     → no status filter
    ?status=   open             "   open"         "OPEN"
    ?status=in progress         "in progress"     "IN PROGRESS"
    ?status=done                "done"            "DONE"        → 400 (next step)
    ```

#### 4.2 Validate status (lines 12-14)
- `if (status && ...)` -> validate only if status was sent (after cleaning). If undefined, skip - admin just doesn't want a status filter.
- `TASK_STATUSES.includes(status as TaskStatus)` -> same check as validateStatus in user.task.service.ts (see step 1 for why `as TaskStatus`)
- Why validate here? Wrong status like "DONE" would not crash the DB (it's just `status = 'DONE'`), it would return `[]`. But returning 400 tells the client clearly that "DONE" is not a valid status, instead of silently returning nothing.
- search has no validation - any text is a valid search.

#### 4.3 Call repository and return
- Pass the cleaned values `{ search, status }` (AdminTaskListFilters) to findAllTasks
- Return `{ tasks }` -> matches AdminTaskListResponse. The route sends this object as `data`, so response becomes `data: { tasks: [...] }` (same shape as GET /api/tasks)

### 5. Create requireAdmin middleware in src/middlewares/admin.middleware.ts
- Why admin middleware? authenticate only answers "is this user logged in?". Admin routes need one more question: "is this logged-in user an ADMIN?". Instead of writing this check inside every admin route, we write it once as a middleware and plug it into the admin router.
- Where does role come from? At login, signAccessToken puts `{ userId, email, role }` inside the JWT (see User Login Flow). authenticate verifies the token and puts this payload in `req.user`. So requireAdmin just reads `req.user.role` - no DB query needed.
- Flow
    ```
    Request (already passed authenticate → req.user is set)
                │
                ↓
        requireAdmin middleware
                │
                ├── req.user.role is not 'ADMIN' ──→ next(AppError 403) ──→ errorHandler
                │
                ↓
            next() ──→ Route handler
    ```
- Create requireAdmin function
    - Check `req.user?.role !== "ADMIN"` - if not admin, pass AppError 403 to next() and return
    - Else call next() to move to the route handler
    ```
    import { Request, Response, NextFunction } from "express";
    import { AppError } from "../errors/AppError";

    export function requireAdmin(
        req: Request,
        _res: Response,
        next: NextFunction,
    ): void {
        if (req.user?.role !== "ADMIN") {
            next(
                new AppError(
                    403,
                    "Admin access required. You do not have admin access it seems",
                ),
            );
            return;
        }

        next();
    }
    ```
- `req.user?.role` -> `?.` because req.user is optional in its type (see express.d.ts). If somehow requireAdmin runs without authenticate, req.user is undefined → `undefined !== "ADMIN"` → 403. So it fails safely (blocks the request) instead of crashing.
- `return` after `next(error)` -> very important. Without return, the code continues and calls `next()` again → the request goes to the route handler even for non-admin users.
- `_res` -> response is not used here. `_` prefix tells TypeScript (noUnusedParameters) that it is unused on purpose. Same as in errorHandler.
- Why 403 and not 401?
    - 401 Unauthorized -> "who are you?" - token missing/invalid (authenticate handles this)
    - 403 Forbidden -> "I know who you are, but you are not allowed" - logged in, but not admin
- Is it safe to trust role from the token? Yes - the token is signed with JWT_SECRET. If someone changes `"role": "USER"` to `"ADMIN"` inside the token, the signature no longer matches and verifyAccessToken throws 401.
    - Side effect: if you change a user's role in DB, the old token still has the old role until it expires. User must login again to get a token with the new role.

### 6. Create admin task route in src/routes/admin.task.routes.ts
- `adminTaskRouter.use(authenticate, requireAdmin)` -> applies BOTH middlewares to all routes of this router, in this order:
    1. authenticate -> verifies the token and sets req.user (401 if not logged in)
    2. requireAdmin -> checks `req.user.role === 'ADMIN'` (403 if not admin) - see step 5
    - Order matters - requireAdmin needs req.user, which is set only by authenticate. If you write `use(requireAdmin, authenticate)`, req.user is always undefined in requireAdmin → every request gets 403, even admins.
- get method with "/" path - final endpoint becomes /api/admin/tasks (prefix is added in index.ts)
- Get search & status from `req.query` (query string), not from req.body
    ```
    import { Request, Response, NextFunction, Router } from "express";
    import { authenticate } from "../middlewares/auth.middleware";
    import { requireAdmin } from "../middlewares/admin.middleware";
    import { getAdminTasks } from "../services/admin.task.service";
    import { AppError } from "../errors/AppError";

    export const adminTaskRouter = Router();

    adminTaskRouter.use(authenticate, requireAdmin)

    adminTaskRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { search, status } = req.query

            // req.query values can be arrays/objects (e.g. ?status=OPEN&status=RESOLVED), so allow only plain strings
            if ((search !== undefined && typeof search !== "string") ||
                (status !== undefined && typeof status !== "string")) {
                throw new AppError(400, "search and status must be single string values")
            }

            const data = await getAdminTasks({ search, status })

            res.status(200).json({
                success: true,
                data
            })

        } catch (error) {
            next(error)
        }
    })
    ```

#### 6.1 Why check the type of req.query values? (lines 16-19)
- We expect `?status=OPEN` → status = "OPEN" (a string). But the client controls the URL and can send other shapes:
    ```
    URL                                   req.query.status
    (not sent)                            undefined
    ?status=OPEN                          "OPEN"                   ← string
    ?status=OPEN&status=RESOLVED          ["OPEN", "RESOLVED"]     ← ARRAY (same key twice)
    ```
- Because of this, TypeScript's type of `req.query.status` is not `string`. It is something like `string | string[] | ParsedQs | ParsedQs[] | undefined`.
- 2 problems if we don't check:
    1. Runtime crash - service calls `query.status?.toUpperCase()`. An array has no toUpperCase → `TypeError: toUpperCase is not a function` → errorHandler → 500. But it is the client's mistake, so it should be 400 (same idea as validateTaskId).
    2. TypeScript error - getAdminTasks expects `search?: string, status?: string`. TypeScript won't allow passing `string | string[] | ...`.
- How the condition works - for each value, "it is OK if it is not sent OR it is a string":
    ```
    (search !== undefined && typeof search !== "string")
       │                        │
       │                        └── ...and it is NOT a string (array/object)
       └── it was sent...
    ```
    - If this is true for search OR (`||`) for status → throw AppError 400
    ```
    search             status                 result
    undefined          undefined              OK  (no filters)
    "login"            undefined              OK
    "login"            "OPEN"                 OK
    "login"            ["OPEN","RESOLVED"]    400
    ```
- Bonus: after this `if`, TypeScript is smart enough to know (type narrowing) that search & status can only be `string | undefined`. That is why `getAdminTasks({ search, status })` compiles without any `as` cast.

### 7. Provide the admin task route to root route in src/routes/index.ts
- All admin task routes get "/admin/tasks" prefix → final endpoint becomes /api/admin/tasks
    ```
    import { Router } from 'express'
    import { healthRouter } from './health.route';
    import { authRouter } from './auth.routes';
    import { userTaskRouter } from './user.task.routes';
    import { adminTaskRouter } from './admin.task.routes';

    export const apiRouter = Router()

    apiRouter.use(healthRouter);
    apiRouter.use("/auth", authRouter)
    apiRouter.use("/tasks", userTaskRouter)
    apiRouter.use("/admin/tasks", adminTaskRouter)
    ```
- Test: GET /api/admin/tasks?search=login&status=open with header (no body needed)
    ```
    Authorization: Bearer <accessToken of an ADMIN user, received from /login>
    ```
- Response
    ```
    {
        "success": true,
        "data": {
            "tasks": [
                {
                    "id": "<uuid>",
                    "title": "Fix login bug",
                    "status": "OPEN",
                    "user_id": "<id of the user who created it>",
                    "created_at": "...",
                    "updated_at": "..."
                }
            ]
        }
    }
    ```
- Response - when nothing matches (200 with empty array, not 404 - an empty list is a valid result)
    ```
    {
        "success": true,
        "data": {
            "tasks": []
        }
    }
    ```
- Response - when status is invalid, e.g. ?status=done (400)
    ```
    {
        "success": false,
        "message": "Status must be one of Open, In Progress or Resolved"
    }
    ```
- Response - when same key is sent twice, e.g. ?status=OPEN&status=RESOLVED (400)
    ```
    {
        "success": false,
        "message": "search and status must be single string values"
    }
    ```
- Response - when logged-in user is not an admin (403)
    ```
    {
        "success": false,
        "message": "Admin access required. You do not have admin access it seems"
    }
    ```
- Response - when token is missing (401)
    ```
    {
        "success": false,
        "message": "Access Token is required"
    }
    ```


## Admin PATCH API for Status Update
- Why? A normal user can change the status of only their OWN task (PATCH /api/tasks/:taskId). An ADMIN (support team) should be able to change the status of ANY task, e.g. move a user's task from OPEN → IN PROGRESS → RESOLVED.
- Difference from user PATCH
    ```
                        User PATCH (/api/tasks/:taskId)        Admin PATCH (/api/admin/tasks/:taskId/status)
    Who                 logged-in user                         logged-in ADMIN
    Which tasks         only own task (id AND user_id)         any task (only id)
    Fields              title and/or status                    only status
    status input        must be exact "OPEN"...                "open", " Open " also allowed (trim + uppercase)
    ```
- Why `/:taskId/status` and not just `/:taskId`? The path itself says WHAT is being changed. Admin can change only the status, so a separate, specific endpoint is clearer than a generic "update task" endpoint. Later, other admin actions can get their own paths (e.g. `/:taskId/assign`).
- Flow
    ```
    PATCH /api/admin/tasks/:taskId/status { status }
    (Authorization: Bearer <accessToken of ADMIN>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        requireAdmin middleware (admin.middleware.ts)
                │
                ├── role is not ADMIN ──→ AppError 403
                │
                ↓
        PATCH "/:taskId/status" route (admin.task.routes.ts)
                │
                ↓
        updateAdminTaskStatus(req.params.taskId, req.body.status) (admin.task.service.ts)
                │
                ↓
        validateTaskId(taskId) (task.validator.ts)
                │
                ├── not a valid UUID ──→ AppError 400
                │
                ↓
        normalize status (string? → trim → uppercase)
                │
                ├── not sent / not a string / not one of OPEN / IN PROGRESS / RESOLVED ──→ AppError 400
                │
                ↓
        updateTaskStatus(taskId, normalizedStatus) (admin.task.repository.ts)
                │
                ├── task not found ──→ AppError 404
                │
                ↓
        200 { success, data: { task } }
    ```

### 1. Create updateTaskStatus in src/repositories/admin.task.repository.ts (DB related logic)
- Create updateTaskStatus function. The function will return the updated task (if found) or null (if not found)
- Write query to update the status of one task - `$1`, `$2` are parameterized values & `[status, taskId]` provides the values (prevents SQL injection)
    - Order matters - `$1` is the FIRST item of the array, `$2` is the SECOND. Here `$1` = status, `$2` = taskId. If you write `[taskId, status]`, Postgres tries to set status = <uuid> and search id = 'OPEN'.
- `WHERE id = $2` -> only id, NO `user_id` check. This is the main difference from user's updateTaskByPatch. Admin can update any user's task. It is safe because only admins reach this code (requireAdmin runs before the route).
- `updated_at = NOW()` -> set the update time (same as user PATCH)
- `RETURNING ...` -> return the updated row, so we can send it back in the response (no extra SELECT needed)
- `result.rows[0] ?? null` -> if no row matched the id, rows is `[]` and `rows[0]` is undefined. `?? null` converts it to null, so the service can check `if(!task)` → 404
- No COALESCE needed here (unlike user PATCH) - status is the only field and it is always sent (service makes sure of it)
    ```
    export const updateTaskStatus = async (taskId: string, status: string): Promise<Task | null> => {
        const result = await pool.query<TaskRow>(
            `
            UPDATE support_tasks
            SET status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, title, status, user_id, created_at, updated_at
            `,
            [status, taskId]
        )

        return result.rows[0] ?? null;
    }
    ```

### 2. Create updateAdminTaskStatus in src/services/admin.task.service.ts (Business logic)
- Validate taskId, normalize status, validate it, call updateTaskStatus from repository, and throw 404 if task is not found
    ```
    import { AppError } from "../errors/AppError";
    import { findAllTasks, updateTaskStatus } from "../repositories/admin.task.repository";
    import { AdminTaskListQuery, AdminTaskListResponse } from "../types/admin";
    import { Task, TASK_STATUSES, TaskStatus } from "../types/task";
    import { validateTaskId } from "../validators/task.validator";

    export const updateAdminTaskStatus = async (taskId: string, status: unknown): Promise<Task> => {
        validateTaskId(taskId)

        const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : undefined

        if (!normalizedStatus || !TASK_STATUSES.includes(normalizedStatus as TaskStatus)) {
            throw new AppError(400, `Status must be one of ${TASK_STATUSES.join(', ')}`)
        }

        const task = await updateTaskStatus(taskId, normalizedStatus as TaskStatus)

        if(!task){
            throw new AppError(404, 'Task Not Found')
        }

        return task;
    }
    ```

#### 2.1 Validate taskId (line 24)
- Why? Admin PATCH also gets taskId from the URL. Without this check, PATCH /api/admin/tasks/abc/status reaches Postgres → "invalid input syntax for type uuid" → errorHandler → 500. Client's mistake should be 400.
- Re-use the same validateTaskId created for the user routes (see GET individual Task step 2) - just import it from validators. This is why it was kept in its own file and not inside user.task.service.ts.
- Call it FIRST - if taskId is not a valid UUID, throw 400 before doing anything else (no need to check status or hit the DB for a request that can never succeed)

#### 2.2 Normalize status (line 26)
- `status: unknown` -> it comes directly from req.body, so it can be anything (string, number, null, object, or not sent at all). Same idea as validateStatus in user.task.service.ts.
- `typeof status === 'string' ? ... : undefined` -> only if it is a string, clean it. Anything else (number, null, array, not sent) becomes undefined → 400 in next step.
    - Why check the type first? `(123).trim()` → `TypeError: trim is not a function` → 500. It is the client's mistake, so it should be 400.
    - Why not `status?.trim()` (like getAdminTasks)? `?.` only protects against undefined/null. It does NOT protect against a number or an object.
- `.trim().toUpperCase()` -> same as getAdminTasks - "  in progress " → "IN PROGRESS"
- What we get for different inputs
    ```
    req.body                        normalizedStatus
    { "status": "resolved" }        "RESOLVED"
    { "status": " In Progress " }   "IN PROGRESS"
    { "status": "" }                ""             → 400 (next step)
    { "status": "done" }            "DONE"         → 400 (next step)
    { "status": 1 }                 undefined      → 400 (next step)
    {}                              undefined      → 400 (next step)
    ```

#### 2.3 Validate status (lines 28-30)
- `!normalizedStatus` -> catches undefined (not a string / not sent) AND `""` (empty string is falsy). Unlike GET (where status is an optional filter), here status is REQUIRED - there is nothing else to update.
- `!TASK_STATUSES.includes(normalizedStatus as TaskStatus)` -> must be one of the allowed values (see Admin + Search/Filters step 1 for why `as TaskStatus`)
- Why validate here, if the DB has a CHECK constraint? Without this, "DONE" reaches Postgres → CHECK constraint error → errorHandler treats it as unknown error → 500. Client's mistake should be 400.
- `` `Status must be one of ${TASK_STATUSES.join(', ')}` `` -> message is built from the array → "Status must be one of OPEN, IN PROGRESS, RESOLVED". If a new status is added to TASK_STATUSES, the message updates automatically (no hardcoded list).

#### 2.4 Call repository, check 404 and return
- `normalizedStatus as TaskStatus` -> after the `if`, we know it is a valid status, but TypeScript can't narrow a `string` through `includes()`, so we tell it with `as`
- `await` is important here. Without `await`, task is a Promise (not the row). A Promise is always truthy, so `if(!task)` never runs and 404 is never thrown.
- If task is null (no task with this id) - throw AppError 404 (Not Found)
- Return type is `Promise<Task>` (not `Task | null`) -> if task were null, we have already thrown 404. So when this function returns, task is always a Task.

### 3. Create patch route in src/routes/admin.task.routes.ts
- patch method with "/:taskId/status" path - final endpoint becomes /api/admin/tasks/:taskId/status
- authenticate & requireAdmin already run for this route because of `adminTaskRouter.use(authenticate, requireAdmin)` (added in Admin + Search/Filters step 6)
- Get taskId from req.params and status from req.body
    - No userId needed (unlike user PATCH) - admin is not limited to their own tasks
- Call updateAdminTaskStatus and send response with status 200 (OK) with the updated task
- Catch the error (e.g. AppError 400/404) and pass it to errorHandler using next(error)
    ```
    import { getAdminTasks, updateAdminTaskStatus } from "../services/admin.task.service";

    adminTaskRouter.patch('/:taskId/status', async (req, res, next) => {
        try {
            const task = await updateAdminTaskStatus(req.params.taskId, req.body.status)

            res.status(200).json({
                success: true,
                data: { task }
            })
        } catch (error) {
            next(error)
        }
    })
    ```
- No change needed in src/routes/index.ts - adminTaskRouter is already plugged with "/admin/tasks" prefix
- Test: PATCH /api/admin/tasks/<taskId>/status with header and body
    ```
    Authorization: Bearer <accessToken of an ADMIN user, received from /login>
    ```
    ```
    {
        "status": "resolved"
    }
    ```
- Response - status is saved in uppercase
    ```
    {
        "success": true,
        "data": {
            "task": {
                "id": "<taskId>",
                "title": "Fix login bug",
                "status": "RESOLVED",
                "user_id": "<id of the user who created it>",
                "created_at": "...",
                "updated_at": "<new time>"
            }
        }
    }
    ```
- Response - when status is missing, empty, not a string or not allowed, e.g. "status": "done" (400)
    ```
    {
        "success": false,
        "message": "Status must be one of OPEN, IN PROGRESS, RESOLVED"
    }
    ```
- Response - when taskId is not a valid UUID, e.g. PATCH /api/admin/tasks/abc/status (400)
    ```
    {
        "success": false,
        "message": "Invalid task id."
    }
    ```
- Response - when no task has this id (404)
    ```
    {
        "success": false,
        "message": "Task Not Found"
    }
    ```
- Response - when logged-in user is not an admin (403)
    ```
    {
        "success": false,
        "message": "Admin access required. You do not have admin access it seems"
    }
    ```
- Response - when token is missing (401)
    ```
    {
        "success": false,
        "message": "Access Token is required"
    }
    ```


## Admin Delete Task
- Why? A normal user can delete only their OWN task (DELETE /api/tasks/:taskId). An ADMIN (support team) should be able to delete ANY task, e.g. remove spam, duplicate or invalid tasks created by users.
- Difference from user DELETE
    ```
                        User DELETE (/api/tasks/:taskId)       Admin DELETE (/api/admin/tasks/:taskId)
    Who                 logged-in user                         logged-in ADMIN
    Which tasks         only own task (id AND user_id)         any task (only id)
    404 when            not found / belongs to another user    not found
    ```
- Why `/:taskId` and not `/:taskId/delete`? With DELETE, the HTTP method itself says WHAT is being done (delete the whole task). In PATCH, we added `/status` because only one field of the task is changed.
- Flow
    ```
    DELETE /api/admin/tasks/:taskId
    (Authorization: Bearer <accessToken of ADMIN>)
                │
                ↓
        authenticate middleware (auth.middleware.ts)
                │
                ├── Missing/Invalid token ──→ AppError 401
                │
                ↓
        requireAdmin middleware (admin.middleware.ts)
                │
                ├── role is not ADMIN ──→ AppError 403
                │
                ↓
        DELETE "/:taskId" route (admin.task.routes.ts)
                │
                ↓
        deleteTaskWithAdmin(req.params.taskId) (admin.task.service.ts)
                │
                ↓
        validateTaskId(taskId) (task.validator.ts)
                │
                ├── not a valid UUID ──→ AppError 400
                │
                ↓
        deleteTaskByAdmin(taskId) (admin.task.repository.ts)
                │
                ├── no row deleted (task not found) ──→ AppError 404
                │
                ↓
        200 { success, message }
    ```

### 1. Create deleteTaskByAdmin in src/repositories/admin.task.repository.ts (DB related logic)
- Create deleteTaskByAdmin function. The function will return `true` (if task was deleted) or `false` (if no task was deleted)
- Write query to delete one task - `$1` is a parameterized value & `[taskId]` provides the value (prevents SQL injection)
- `WHERE id = $1` -> only id, NO `user_id` check. This is the main difference from user's deleteTask. Admin can delete any user's task. It is safe because only admins reach this code (requireAdmin runs before the route).
- No `RETURNING` here - we don't need the deleted row back, we only need to know whether something was deleted (same as user's deleteTask)
- `result.rowCount` -> number of rows deleted
    - task found & deleted → rowCount = 1 → return true
    - task not found → rowCount = 0 → return false
    - Why `?? 0`? In pg types, rowCount is `number | null`, so we convert null to 0 before comparing
    ```
    export const deleteTaskByAdmin = async (taskId: string): Promise<boolean> => {
        const result = await pool.query(
            `
            DELETE FROM support_tasks
            WHERE id = $1
            `,
            [taskId]
        )

        return (result.rowCount ?? 0) > 0
    }
    ```
- Note: `pool.query` has no `<TaskRow>` generic here, because DELETE without RETURNING returns no rows

### 2. Create deleteTaskWithAdmin in src/services/admin.task.service.ts (Business logic)
- Validate taskId using validateTaskId (same one used in updateAdminTaskStatus & user routes) - else 400
    - Without this, DELETE /api/admin/tasks/abc reaches Postgres → "invalid input syntax for type uuid" → errorHandler → 500. Client's mistake should be 400.
- Call deleteTaskByAdmin from repository
    - `await` is important here. Without `await`, deletedTask is a Promise (not a boolean). A Promise is always truthy, so `if(!deletedTask)` never runs and 404 is never thrown.
- If deletedTask is false (no task with this id) - throw AppError 404 (Not Found)
- Return type is `Promise<void>` - nothing to return. If no error is thrown, it means the task was deleted. (same as deleteUserTask)
    ```
    import { deleteTaskByAdmin, findAllTasks, updateTaskStatus } from "../repositories/admin.task.repository";

    export const deleteTaskWithAdmin = async (taskId: string): Promise<void> => {
        validateTaskId(taskId)

        const deletedTask = await deleteTaskByAdmin(taskId);

        if (!deletedTask) {
            throw new AppError(404, "Task not found.")
        }
    }
    ```

### 3. Create delete route in src/routes/admin.task.routes.ts
- delete method with "/:taskId" path - final endpoint becomes /api/admin/tasks/:taskId
- authenticate & requireAdmin already run for this route because of `adminTaskRouter.use(authenticate, requireAdmin)` (added in Admin + Search/Filters step 6)
- Get taskId from req.params
    - No userId needed (unlike user DELETE) - admin is not limited to their own tasks
- Call deleteTaskWithAdmin and send response with status 200 (OK) with a success message
    - There is no task to send back (it is deleted), so we send only a message (same as user DELETE)
- Catch the error (e.g. AppError 400/404) and pass it to errorHandler using next(error)
    ```
    import { deleteTaskWithAdmin, getAdminTasks, updateAdminTaskStatus } from "../services/admin.task.service";

    adminTaskRouter.delete('/:taskId', async (req, res, next) => {
        try {
            await deleteTaskWithAdmin(req.params.taskId)

            res.status(200).json({
                success: true,
                message: `Task ${req.params.taskId} deleted successfully by Admin.`
            })
        } catch (error) {
            next(error)
        }
    })
    ```
    - Note: deleteTaskWithAdmin returns nothing, so there is no need to store its result in a variable - just `await` it.
- No change needed in src/routes/index.ts - adminTaskRouter is already plugged with "/admin/tasks" prefix
- Test: DELETE /api/admin/tasks/<taskId> with header (no body needed)
    ```
    Authorization: Bearer <accessToken of an ADMIN user, received from /login>
    ```
- Response
    ```
    {
        "success": true,
        "message": "Task <taskId> deleted successfully by Admin."
    }
    ```
- Response - when no task has this id, or it is already deleted (404)
    ```
    {
        "success": false,
        "message": "Task not found."
    }
    ```
- Response - when taskId is not a valid UUID, e.g. DELETE /api/admin/tasks/abc (400)
    ```
    {
        "success": false,
        "message": "Invalid task id."
    }
    ```
- Response - when logged-in user is not an admin (403)
    ```
    {
        "success": false,
        "message": "Admin access required. You do not have admin access it seems"
    }
    ```
- Response - when token is missing (401)
    ```
    {
        "success": false,
        "message": "Access Token is required"
    }
    ```


# Redis

## Definition

- Redis (**RE**mote **DI**ctionary **S**erver) is an in-memory data store that stores and retrieves data using **keys**.
- Think of it as a giant, very fast `key → value` map that lives on a server and can be shared by many backend instances.
- Redis keeps data primarily in **RAM**, which makes reads/writes extremely fast (often sub-millisecond).
- It can also **persist data to disk** (RDB snapshots / AOF logs), so data can survive a restart — it is not limited to temporary storage.
- Values are not just strings: Redis supports data structures like **Strings, Lists, Sets, Sorted Sets, Hashes**, and more.

## Why Redis is needed even though we have a normal backend database

- **Frequently accessed data:** Redis can return a cached result for repeated requests, reducing repeated database work.
- **Speed:** Reading from RAM is much faster than running a query on PostgreSQL (disk, query planning, joins).
- **Reduced DB load:** Fewer queries hit the main database, so it can handle more users.
- **Shared state:** Multiple server instances can share the same data (sessions, counters, rate limits) through one Redis.

> Redis usually **does not replace** the main database. PostgreSQL stays the source of truth; Redis sits beside it as a fast helper layer.

## Usages

- **Caching:** Temporary fast layer in front of the main database.
- **Rate limiting:** Limit how many requests a user can make within a time window.
- **Counting:** e.g. counting page views or likes (`INCR` is atomic, so no race conditions).
- **Sessions:** Store logged-in user session data with an expiry.
- **Message broker:** Pub/Sub and Streams for sending messages between services.
- **Background jobs / queues:** Job queue libraries (e.g. BullMQ) use Redis to store jobs.
- **Leaderboards:** Sorted Sets keep items ranked by score.

## Redis vs PostgreSQL

| Feature              | PostgreSQL                                 | Redis                                     |
| -------------------- | ------------------------------------------ | ----------------------------------------- |
| Primary storage      | Disk-backed database with memory caching   | Primarily in-memory                       |
| Typical access speed | Depends on query, indexes, and cache state | Very low-latency key access               |
| Data model           | Relational tables                          | Key-value and specialized data structures |
| Querying             | SQL, joins, aggregations                   | Commands on keys and data structures      |
| Common use           | Persistent business data                   | Caching, counters, rate limits, sessions  |
| Persistence          | Durable database storage                   | Configurable persistence options          |
| Data size            | Limited by disk (can be very large)        | Limited by available RAM                  |

## Redis setup

### 1. Run Redis with Docker

Redis runs as a container defined in `docker-compose.yml` (alongside PostgreSQL):

```yaml
redis:
  image: redis:7-alpine # lightweight Redis 7 image
  container_name: redis_course_redis
  restart: unless-stopped
  ports:
    - "6379:6379" # 6379 = default Redis port (host:container)
  volumes:
    - redis_data:/data # persist Redis data across container restarts
```

```bash
docker compose up -d                              # start Postgres + Redis in the background
docker ps                                         # confirm redis_course_redis is running
docker exec -it redis_course_redis redis-cli      # open the Redis CLI inside the container
127.0.0.1:6379> PING                              # → PONG means Redis is working
```

### 2. Install the Node.js client

```bash
npm install redis        # official Redis client for Node.js (v6 in package.json)
npm install -D tsx       # run TypeScript files directly without compiling
```

### 3. Add the connection URL to `.env`

```env
REDIS_URL=redis://localhost:6379
```

URL format: `redis://[username:password@]host:port[/db-number]`

### 4. Connect from code (`exmples/redis-data-types.ts`)

```ts
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config(); // load variables from .env into process.env

const redis = createClient({ url: process.env.REDIS_URL });

redis.on("error", (err) => console.error("Redis error:", err)); // log connection errors

const run = async () => {
  await redis.connect(); // must be awaited before sending commands
  console.log("Connected to Redis.");
  console.log("Ping", await redis.ping()); // → "PONG"
  await redis.close(); // close the connection so the script exits
};

run().catch((error) => {
  console.error("Demo failed: ", error);
  process.exit(1);
});
```

Key points:

- `createClient()` only **creates** the client; `connect()` actually opens the connection.
- All commands are **async** and return Promises → use `await`.
- `ping()` is the simplest health check: Redis replies `PONG`.
- Call `close()` at the end of scripts, otherwise the open connection keeps Node running.

### 5. Run the example

A script was added to `package.json`:

```json
"example:redis-types": "tsx exmples/redis-data-types.ts"
```

```bash
npm run example:redis-types
# Connected to Redis.
# Ping PONG
```

## Commands

| Command      | Purpose                               | Example                                          |
| ------------ | ------------------------------------- | ------------------------------------------------ |
| `SET`        | Store a value                         | `SET user:1:name "Omkesh"`                       |
| `GET`        | Retrieve a value                      | `GET user:1:name` → `"Omkesh"`                   |
| `DEL`        | Delete a key                          | `DEL user:1:name` → `1` (number of keys deleted) |
| `EXISTS`     | Check whether a key exists            | `EXISTS user:1:name` → `1` (yes) / `0` (no)      |
| `EXPIRE`     | Set a key's expiration (seconds)      | `EXPIRE user:1:name 60`                          |
| `TTL`        | Check remaining lifetime (seconds)    | `TTL user:1:name` → `58`                         |
| `SET ... EX` | Store a value with expiry in one step | `SET otp:123 "4567" EX 300`                      |
| `INCR`       | Atomically increase a number by 1     | `INCR post:10:views`                             |

`TTL` return values:

- `> 0` → seconds left before the key is deleted
- `-1` → key exists but has **no expiry**
- `-2` → key **does not exist** (or already expired)

Same commands in Node.js (`redis` client uses camelCase):

```ts
await redis.set("user:1:name", "Omkesh");
await redis.get("user:1:name"); // 'Omkesh'
await redis.set("otp:123", "4567", { expiration: { type: "EX", value: 300 } }); // expires in 300s
await redis.expire("user:1:name", 60);
await redis.ttl("user:1:name");
await redis.exists("user:1:name"); // 1 or 0
await redis.del("user:1:name");
```

> **Key naming convention:** use `:` to namespace keys, e.g. `user:1:profile`, `post:10:views`. It keeps keys readable and organized.

## Redis Data Types

Code for all examples: `exmples/redis-data-types.ts` → run with `npm run example:redis-types`.

Every Redis entry is `key → value`. The **data type** decides what the value looks like and which commands you can run on it.

### Quick summary: which type should I use?

| Type           | What it holds                                     | Think of it as               | Typical use                           |
| -------------- | ------------------------------------------------- | ---------------------------- | ------------------------------------- |
| **String**     | One value (text or number)                        | A single variable            | Cache a value, counters, OTP          |
| **Hash**       | Many `field → value` pairs                        | A JS object `{ name, city }` | User profile, settings                |
| **List**       | Ordered values (duplicates allowed)               | A JS array                   | Recent messages, activity feed, queue |
| **Set**        | Unique values, no order                           | A JS `Set`                   | Tags, unique visitors                 |
| **Sorted Set** | Unique values, each with a score, sorted by score | A ranked list                | Leaderboards, top-N, priority         |

> Node.js client method names = Redis command in camelCase: `HSET` → `hSet`, `LPUSH` → `lPush`, `ZADD` → `zAdd`.

---

### 1. String: one key → one value

The simplest type. The value can be text, a number, or JSON (`JSON.stringify`).

```ts
const stringKey = "demo:page_views";

await redis.set(stringKey, 100); // store
const pageViews = await redis.get(stringKey);
console.log(pageViews); // '100'  ← comes back as a STRING, not a number
```

**Strings as counters:** if the value looks like a number, `INCR` adds 1 to it.

```ts
const afterIncr = await redis.incr(stringKey);
console.log(afterIncr); // 101  ← INCR returns a number
```

- `INCR` is **atomic**: if 1000 requests call it at the same time, none are lost (no read → add → write race).
- If the key doesn't exist, `INCR` treats it as `0` → result `1`.
- Related: `INCRBY key 5`, `DECR key`, `DECRBY key 5`.

CLI:

```
SET demo:page_views 100
GET demo:page_views      → "100"
INCR demo:page_views     → 101
```

---

### 2. Hash: one key → many fields

Use when one "thing" has several properties. Like storing a small object under one key.

```ts
const hashKey = "demo:user:profile";

await redis.hSet(hashKey, {
  // set one or many fields at once
  name: "Omkesh",
  city: "Pune",
});

const profileData = await redis.hGetAll(hashKey); // read all fields
console.log(profileData); // { name: 'Omkesh', city: 'Pune' }
```

Other useful hash commands:
| Command | Node.js | What it does |
|---|---|---|
| `HGET key field` | `hGet(key, 'city')` | Read one field → `'Pune'` |
| `HDEL key field` | `hDel(key, 'city')` | Delete one field |
| `HINCRBY key field n` | `hIncrBy(key, 'age', 1)` | Increase a numeric field |

**Hash vs String with JSON:** with a hash you can read/update **one field** (`hSet(key, { city: 'Mumbai' })`) without reading and rewriting the whole object.

> All hash values are stored as strings, so `hGetAll` always returns strings.

CLI:

```
HSET demo:user:profile name "Omkesh" city "Pune"
HGETALL demo:user:profile
HGET demo:user:profile city    → "Pune"
```

---

### 3. List: ordered values

Keeps values in insertion order. Duplicates are allowed. You can add/remove from **both ends**.

```ts
const listKey = "demo:message";

await redis.lPush(listKey, "X"); // [X]
await redis.lPush(listKey, "Y"); // [Y, X]
await redis.lPush(listKey, "Z"); // [Z, Y, X]

const extractMessage = await redis.lRange(listKey, 0, -1); // read all
console.log(extractMessage); // [ 'Z', 'Y', 'X' ]
```

**Why `Z, Y, X` and not `X, Y, Z`?** `lPush` = push on the **Left** (start). Each new item goes in front, so the newest comes first. Use `rPush` to keep `X, Y, Z` order.

| Command                 | Node.js                   | What it does                                   |
| ----------------------- | ------------------------- | ---------------------------------------------- |
| `LPUSH`                 | `lPush(key, v)`           | Add to the **start** (left)                    |
| `RPUSH`                 | `rPush(key, v)`           | Add to the **end** (right)                     |
| `LRANGE key start stop` | `lRange(key, 0, -1)`      | Read items by index (`0` = first, `-1` = last) |
| `LTRIM key start stop`  | `lTrim(key, 0, 9)`        | Keep only that range, delete everything else   |
| `LPOP` / `RPOP`         | `lPop(key)` / `rPop(key)` | Remove and return an item from start / end     |
| `LLEN`                  | `lLen(key)`               | Number of items                                |

**Common pattern: "latest 10 messages"**

```ts
await redis.lPush("chat:recent", newMessage); // newest at the front
await redis.lTrim("chat:recent", 0, 9); // keep only 10 newest
await redis.lRange("chat:recent", 0, -1); // read them
```

`LPUSH` + `RPOP` (or `RPUSH` + `LPOP`) = a simple **queue** (first in, first out).

> ⚠️ Gotcha: lists keep growing. Running the example script twice gives `[Z, Y, X, Z, Y, X]`. Use `del(key)` or `lTrim` to reset/limit it.

---

### 4. Set: unique values only

No duplicates, no guaranteed order. Adding an existing value does nothing.

```ts
const setKey = "demo:tags";

await redis.sAdd(setKey, "nodejs");
await redis.sAdd(setKey, "reactjs");
await redis.sAdd(setKey, "nextjs");
await redis.sAdd(setKey, "nodejs"); // duplicate → ignored (returns 0)

const tagCount = await redis.sCard(setKey); // count members
console.log(tagCount); // 3  (not 4)
```

| Command     | Node.js             | What it does                                |
| ----------- | ------------------- | ------------------------------------------- |
| `SADD`      | `sAdd(key, v)`      | Add value(s); returns how many were **new** |
| `SCARD`     | `sCard(key)`        | Count of members (**Card**inality)          |
| `SMEMBERS`  | `sMembers(key)`     | Get all members                             |
| `SISMEMBER` | `sIsMember(key, v)` | Is `v` in the set? → `1` / `0` (true/false) |
| `SREM`      | `sRem(key, v)`      | Remove a member                             |

Use cases: tags on a post, "unique visitors today" (add user IDs; count with `SCARD`), "has this user already liked this post?" (`SISMEMBER`).

---

### 5. Sorted Set (ZSet): unique values + score, auto-sorted

Like a Set, but each member has a numeric **score**. Redis keeps members sorted by score at all times. Commands start with `Z`.

```ts
const rankKey = "demo:leaderboard";

await redis.zAdd(rankKey, { score: 100, value: "player_a" });
await redis.zAdd(rankKey, { score: 200, value: "player_b" });

const newScore = await redis.zIncrBy(rankKey, 50, "player_a"); // 100 + 50
console.log(newScore); // 150

const rank = await redis.zRevRank(rankKey, "player_a");
console.log(rank); // 1  → 2nd place (player_b has 200)
```

**Rank is 0-based:**

- `ZRANK` → position in **ascending** order (lowest score = 0).
- `ZREVRANK` → position in **descending** order (**highest score = 0 = top rank**). Use this for leaderboards.
- So rank `0` = 1st place, rank `1` = 2nd place, etc.

| Command          | Node.js                            | What it does                               |
| ---------------- | ---------------------------------- | ------------------------------------------ |
| `ZADD`           | `zAdd(key, { score, value })`      | Add member / update its score              |
| `ZINCRBY`        | `zIncrBy(key, 50, member)`         | Add to a member's score, returns new score |
| `ZREVRANK`       | `zRevRank(key, member)`            | Rank, highest score first (0 = top)        |
| `ZSCORE`         | `zScore(key, member)`              | Get a member's score                       |
| `ZRANGE ... REV` | `zRange(key, 0, 9, { REV: true })` | Top 10 members                             |

Use cases: game leaderboards, "most viewed posts", priority queues, scheduling (score = timestamp).

---

### TTL (Time To Live): auto-delete keys

Not a data type. Works on **any** key type. Tells Redis to delete the key automatically after N seconds.

```ts
const otpKey = "demo:otp";

await redis.set(otpKey, "123456");
await redis.expire(otpKey, 60); // delete after 60 seconds

const ttl = await redis.ttl(otpKey);
console.log(ttl); // 60 (seconds left)
```

- Shortcut, set value + expiry in one step: `set(otpKey, '123456', { expiration: { type: 'EX', value: 60 } })`.
- `TTL` returns: `> 0` seconds left, `-1` no expiry set, `-2` key doesn't exist.
- ⚠️ A plain `SET` on an existing key **removes its TTL** unless you pass the expiry again.

Use cases: OTPs, sessions, cache entries, rate-limit windows.

---

### Cheat-sheet: example output of `npm run example:redis-types`

```
Connected to Redis.
Ping PONG
100                                  ← GET (string)
101                                  ← INCR
{ name: 'Omkesh', city: 'Pune' }     ← HGETALL
[ 'Z', 'Y', 'X' ]                    ← LRANGE (LPUSH adds to the front)
3                                    ← SCARD (duplicate 'nodejs' ignored)
150                                  ← ZINCRBY
1                                    ← ZREVRANK (0 = top, so 2nd place)
60                                   ← TTL
```

## Redis in a Node.js project

**Goal:** the Express app connects to Redis **once** when the server starts, reuses that **same connection** for every request, and closes it cleanly when the server stops.

### Big picture

Files involved:

```
docker-compose.yml     → runs the Redis SERVER (a container)
.env                   → REDIS_URL = where the Redis server lives
src/redis/client.ts    → creates ONE Redis client + connectRedis / disconnectRedis helpers
src/server.ts          → loads .env first, calls connectRedis() at startup, disconnectRedis() on shutdown
any route / service    → import { redisClient } and run commands
```

What happens when the app runs:

```
npm run dev
  └─ server.ts → import "dotenv/config"  → .env loaded FIRST
               → startServer()
       ├─ testConnection()   → is Postgres reachable?
       ├─ connectRedis()     → is Redis reachable?
       └─ app.listen()       → only NOW start accepting requests
  ... requests use redisClient (already connected) ...
Ctrl+C (SIGINT)  or  docker stop (SIGTERM)
  └─ shutdown() → disconnectRedis() → process.exit(0)
```

---

### Step 0: Pre-checks

1. **Redis server is running:** `docker compose up -d`, then `docker ps` shows `redis_course_redis`.
   - Why: our Node app is only a _client_. With no Redis server, `connect()` fails and the app will not start.
2. **`docker-compose.yml` has the `redis` service + `redis_data` volume.**
   - Why the volume: Redis data is saved to it, so data survives container restarts.
3. **`redis` npm package is installed** (`npm install redis`). It is the library that lets Node talk to Redis.
4. **`.env` has** `REDIS_URL=redis://localhost:6379`.

---

### Step 1: Create one shared client (`src/redis/client.ts`)

**Why a separate file?**

- All Redis connection code lives in one place. Other files just do `import { redisClient } from '../redis/client'`.
- Node runs a module only **once** and caches it. However many files import `client.ts`, they all get the **same** `redisClient` → the whole app shares one connection.
- If we created a new client per request, we would open hundreds of connections. That is slow and wastes Redis resources.

```ts
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({ url: redisUrl });
```

| Line                            | What it does / why                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `process.env.REDIS_URL`         | Reads the address from `.env`, so it can differ per environment (local, Docker, production) without changing code. |
| `\|\| "redis://localhost:6379"` | Fallback for local dev if the env variable is missing.                                                             |
| `createClient(...)`             | Only **creates** the client object. It does **not** connect yet; `connectRedis()` does that (Step 3).              |

> ⚠️ **`.env` must be loaded before `client.ts` runs**, because `client.ts` reads `process.env.REDIS_URL` the moment it is imported.
>
> **The trap:** all `import`s in a file run _before_ the rest of its code. So this does NOT work reliably:
>
> ```ts
> import dotenv from "dotenv";
> import { connectRedis } from "./redis/client"; // ← client.ts runs HERE, .env not loaded yet
> dotenv.config(); // ← too late for client.ts
> ```
>
> `REDIS_URL` would be `undefined`, and the fallback `localhost` URL is used **silently**. Locally you won't notice, but in Docker/production Redis is somewhere else, so the app fails to connect.
>
> **The fix (used in `server.ts`):** make this the **very first import**:
>
> ```ts
> import "dotenv/config"; // loads .env immediately, as a side effect of importing it
> ```
>
> Imports run top to bottom, so `.env` is loaded before `app`, `db/pool` or `redis/client` are imported. Every file after it can safely read `process.env`.

---

### Step 2: Listen to client events

The client sends **events** as its connection status changes. We listen to them so the terminal shows what is happening.

```ts
redisClient.on("connect", () => console.log("Redis connection established."));
redisClient.on("ready", () => console.log("Redis client is ready."));
redisClient.on("error", (error) => console.log("Redis client error.", error));
redisClient.on("end", () => console.log("Redis client is closed."));
```

| Event     | When it fires                                           | What it tells us      |
| --------- | ------------------------------------------------------- | --------------------- |
| `connect` | Network (TCP) connection to Redis is open               | Redis is reachable    |
| `ready`   | Client finished its setup and can accept commands       | Safe to use Redis now |
| `error`   | Something went wrong (Redis down, connection lost, ...) |
| `end`     | Connection is closed (after `close()`)                  | Shutdown was clean    |

Normal startup output:

```
Redis connection established.
Redis client is ready.
```

---

### Step 3: `connectRedis()`

```ts
export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
```

- **Why a function instead of connecting directly inside `client.ts`?** We decide _when_ to connect (in `startServer`, before `app.listen`). We can also `await` it and catch the error if it fails.
- **Why `await`?** Connecting takes time. `await` waits until it is done, or throws if Redis is unreachable.
- **Why check `isOpen`?** Calling `connect()` on a client that is already open throws an error. The check makes the function safe to call more than once.

---

### Step 4: `disconnectRedis()`

```ts
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.close();
  }
};
```

- **Why close at all?** An open connection keeps the Node process alive. Closing politely also frees that connection on the Redis server.
- **`close()`** lets pending commands finish, then closes. (`destroy()` closes immediately and drops pending commands.)
- **Why check `isOpen`?** Closing an already-closed client throws an error.

---

### Step 5: Use them in `src/server.ts` (entry file)

```ts
import "dotenv/config"; // 0. FIRST line: load .env before anything else
import app from "./app";
import { testConnection } from "./db/pool";
import { connectRedis, disconnectRedis } from "./redis/client";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testConnection(); // 1. Postgres OK?
    await connectRedis(); // 2. Redis OK?

    app.listen(PORT, () => {
      // 3. only now accept requests
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // 1 = exit with failure
  }
}

const shutdown = async () => {
  await disconnectRedis(); // close Redis cleanly
  process.exit(0); // 0 = exit with success
};

process.on("SIGINT", shutdown); // Ctrl+C in terminal
process.on("SIGTERM", shutdown); // docker stop / hosting platforms

startServer();
```

**Why connect before `app.listen()`?**

- The server should take requests only once its databases are ready. If it started listening first, the first requests could hit Redis before it is connected and fail.

**Why `process.exit(1)` in `catch`?**

- "Fail fast": if Postgres or Redis is not reachable, crash loudly at startup instead of running half-broken. Exit code `1` tells Docker, nodemon, etc. that something failed.

**Why the `shutdown` handler? (graceful shutdown)**

- A **signal** is the operating system telling the process "please stop". By default Node just dies immediately, without closing connections.
- Our handler changes that to: close Redis cleanly → then exit with code `0` (success). You will see `Redis client is closed.` in the terminal.

**Why both `SIGINT` and `SIGTERM`?** Different things stop the app with different signals:

| Signal    | Who sends it                                                   |
| --------- | -------------------------------------------------------------- |
| `SIGINT`  | You, pressing **Ctrl+C** in the terminal (local dev)           |
| `SIGTERM` | `docker stop`, Kubernetes, most hosting platforms (production) |

- Only `SIGINT` → clean shutdown locally, but not in Docker/production.
- Only `SIGTERM` → clean shutdown in production, but Ctrl+C kills the app without closing Redis.
- So one `shutdown` function is attached to **both**.

> 💡 Possible improvement for later: only Redis is closed right now. The Postgres pool (`pool.end()`) could be closed inside the same `shutdown` function.

---

### Step 6: Use Redis anywhere in the app

```ts
import { redisClient } from "../redis/client";

await redisClient.set("greeting", "hello");
const value = await redisClient.get("greeting"); // 'hello'
```

No need to connect again: `server.ts` already connected this same client at startup.

---

### Recap

| What we did                            | Why                                                  |
| -------------------------------------- | ---------------------------------------------------- |
| One client in `src/redis/client.ts`    | Whole app shares a single connection                 |
| `import "dotenv/config"` as first line | `.env` is loaded before any file reads `process.env` |
| URL from `REDIS_URL`                   | Change the Redis location without changing code      |
| `error` listener                       | Without it, any Redis error crashes the server       |
| `connect` / `ready` / `end` logs       | See the connection status in the terminal            |
| `connectRedis()` with `isOpen` check   | Connect at the right time, safe to call twice        |
| Connect **before** `app.listen()`      | Never serve requests before Redis is ready           |
| `process.exit(1)` on startup failure   | Fail fast instead of running half-broken             |
| `shutdown()` on `SIGINT` + `SIGTERM`   | Close Redis cleanly on Ctrl+C and on `docker stop`   |

## How Redis caching works

### What is caching?

**Caching** = keeping a **copy** of data in a fast place (Redis, in RAM) so the next request can read it quickly, instead of asking the slow source (PostgreSQL, an external API, a heavy calculation) again.

- The database is still the **source of truth**. The cache only holds a copy.
- A cached copy can be **deleted at any time** (expiry, memory full, restart). The app must still work if the cache is empty.

### Why cache?

- **Faster responses:** reading a key from RAM takes well under a millisecond. A DB query can take tens or hundreds of milliseconds.
- **Less database load:** if 1000 users ask for the same product list, the DB runs the query once instead of 1000 times.
- **Less repeated work:** expensive results (joins, aggregations, API calls) are computed once and reused.

### What is good to cache?

| Good to cache ✅                                                | Not a good fit ❌                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Read often, changes rarely (product list, categories, settings) | Changes on almost every request                                         |
| Expensive to compute (reports, joins, API responses)            | Must always be 100% up to date (account balance, stock during checkout) |
| Same result for many users                                      | Unique per request and never asked again                                |

---

### Cache hit and cache miss

- **Cache HIT:** the data is already in Redis → return it immediately. Fast. 🎉
- **Cache MISS:** the data is not in Redis → read it from the DB (slow) → save it in Redis for next time.
  - Why can it be missing? It was never cached yet, its TTL expired, it was deleted on purpose (invalidation), or Redis removed it because memory was full.

> **Hit ratio** = hits / (hits + misses). A higher hit ratio means the cache is doing its job. The first request is always a miss.

---

### Cache-aside pattern (Lazy loading)

The most common caching pattern, and the one used in our example.

```
Request
  │
  ▼
Check Redis ──── found? ──YES──▶ return cached data          (HIT)
  │
  NO
  ▼
Read from DB ──▶ save copy in Redis (with TTL) ──▶ return data  (MISS)
```

- **"Aside"** → the cache sits _beside_ the app, not between the app and DB. The **app** talks to both. Redis never talks to the database by itself.
- **"Lazy"** → data goes into the cache only when someone asks for it. Nothing is loaded in advance.

**Why use it?**

- Simple to write and understand.
- Only data that is actually requested gets cached → no wasted memory.
- If Redis goes down, the app can still read from the DB (just slower).

**Downside:** the first request (and every request after expiry) is slow. And the cache can hold **old (stale) data** if the DB changes. TTL and invalidation fix this (see below).

---

### TTL: why every cache key should expire

`setEx(key, seconds, value)` = `SET` + `EXPIRE` in one atomic step.

- **Why:** without a TTL, a cached copy stays forever. If the DB changes, users keep seeing old data.
- With a TTL, the worst case is "data is at most N seconds old". After that, the key is deleted and the next request is a miss that loads fresh data.
- Choosing N: short (seconds) for data that changes often; long (minutes/hours) for data that rarely changes. It is a trade-off between **freshness** and **speed / DB load**.

---

### Stale cache problem

**Stale** = old. The cache holds a copy taken at some moment. If the DB changes after that, the copy is **out of date**, but Redis doesn't know about it.

```
10:00  DB    = [Laptop, Keyboard, Mouse, HDD]
10:00  Cache = [Laptop, Keyboard, Mouse, HDD]            ← copy saved (TTL 60s)
10:01  DB    = [Laptop, Keyboard, Mouse, HDD, Desktop]   ← new product added
10:01  Cache = [Laptop, Keyboard, Mouse, HDD]            ← still old! Users don't see "Desktop"
```

**Why does it happen?** In cache-aside, the cache and the DB are two separate stores. Redis never talks to the DB, so when the DB changes, nobody tells Redis.

**Why is it a problem?** Users see wrong data: a product that doesn't show up, an old price, a deleted item that is still listed.

**Two ways to fix it:**

1. **TTL** → the old copy is removed automatically after N seconds. Users may still see old data **until** it expires.
2. **Cache invalidation** → delete the key as soon as the DB changes. Users get fresh data on the very next request. ✅

---

### Cache invalidation: keeping the cache correct

**Invalidation** = removing the cached copy because it is no longer correct.

When data **changes** in the DB (create / update / delete), the cached copy becomes wrong. Fix: **delete the cache key** right after writing to the DB.

```
DB changes ──▶ DEL cache key ──▶ next request: MISS ──▶ read fresh data from DB ──▶ save new copy
```

```ts
// Update product in DB, then remove the old cached copy
await pool.query("UPDATE products SET price = $1 WHERE id = $2", [price, id]);
await redisClient.del("demo:products"); // next GET is a MISS → loads fresh data
```

- **Why delete instead of updating the cache?** Simpler and safer: the next read rebuilds the cache from the DB (the source of truth). No risk of writing the wrong value into the cache.
- **Order:** write to the **DB first**, then delete the cache key.
- TTL is the **safety net**: if an invalidation is ever missed, the stale data still disappears after the TTL.

---

### Storing objects: JSON

Redis strings store **text**, not JS objects/arrays.

- Saving → `JSON.stringify(products)` → `'["Laptop","Keyboard","Mouse","HDD"]'`
- Reading → `JSON.parse(cached)` → back to an array.
- Without `JSON.stringify`, the client cannot send an array as a value, and you would lose its structure.

---

### Cache key naming

- Use namespaced keys: `products:all`, `product:42`, `user:7:orders`.
- If the result depends on input (id, page, filter), put that input **in the key**: `products:page:2`, `products:category:books`. Otherwise different requests would share the same wrong cached value.

---

### Example (`exmples/redis-caching.ts`)

Run: `npm run example:redis-caching`

```ts
import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({ url: redisUrl });

const cacheKey = "demo:products";
const cacheTtlSeconds = 60; // Cache will expire after 60 seconds

let dbProducts = ["Laptop", "Keyboard", "Mouse", "HDD"]; // pretend this is the database (let: we change it later)

const run = async () => {
  await redisClient.connect();

  // 1. Check the cache first
  let cached = await redisClient.get(cacheKey); // string, or null if the key is missing

  // Cache-aside pattern
  if (cached) {
    console.log("Cache HIT"); // 2a. found → use cached copy
    console.log("data: ", JSON.parse(cached)); //     text → array
  } else {
    console.log("Cache MISS"); // 2b. not found

    const products = dbProducts; //     read from main DB (slow in real life)

    // save a copy in Redis for 60s (stringify: Redis stores text)
    await redisClient.setEx(
      cacheKey,
      cacheTtlSeconds,
      JSON.stringify(products),
    );

    console.log("data: ", products); //     return data on a MISS too
  }

  // 3. Stale cache problem: the DB changes, but the cache still has the old copy
  dbProducts = ["Laptop", "Keyboard", "Mouse", "HDD", "Desktop"]; // "Desktop" added in DB
  console.log("dbProducts: ", dbProducts);

  cached = await redisClient.get(cacheKey);
  console.log("cached data:", JSON.parse(cached!)); // still 4 items → STALE
  // `!` tells TypeScript "this is not null" (we just saved it above)

  // 4. Cache invalidation: when the DB changes, delete the old cache
  await redisClient.del(cacheKey);
  console.log("Cache deleted");

  // 5. Next read is a MISS → load fresh data from DB and cache it again
  cached = await redisClient.get(cacheKey); // null

  if (!cached) {
    const freshData = dbProducts;
    await redisClient.setEx(
      cacheKey,
      cacheTtlSeconds,
      JSON.stringify(freshData),
    );
    console.log("Fresh Data: ", freshData);
  }

  await redisClient.close();
};

run().catch((error) => {
  console.error("Demo failed: ", error);
  process.exit(1);
});
```

Output (first run, cache empty):

```
Cache MISS
data:  [ 'Laptop', 'Keyboard', 'Mouse', 'HDD' ]                  ← read from DB, saved in cache
dbProducts:  [ 'Laptop', 'Keyboard', 'Mouse', 'HDD', 'Desktop' ] ← DB changed
cached data: [ 'Laptop', 'Keyboard', 'Mouse', 'HDD' ]            ← cache is STALE (no Desktop)
Cache deleted                                                    ← invalidation
Fresh Data:  [ 'Laptop', 'Keyboard', 'Mouse', 'HDD', 'Desktop' ] ← cache rebuilt from DB
```

Check it in the Redis CLI:

```
GET demo:products     → "[\"Laptop\",\"Keyboard\",\"Mouse\",\"HDD\",\"Desktop\"]"
TTL demo:products     → 42   (seconds left)
```

> ⚠️ **Running it again within 60s:** the first check is a **HIT**, and the cache already has the 5-item list (saved at the end of the last run). So "cached data" equals "dbProducts", and the stale problem is not visible. To see it again, wait 60s or run `DEL demo:products` in the CLI first.

> 💡 The data is printed on **both** a HIT and a MISS. In a real app the user must always get the data; only the place it comes from changes. Also, `redisClient.get()` returns `null` when the key is missing (not `undefined`).

> 💡 In this demo the "DB" is just a variable in the same script. In a real app, invalidation happens in the code that **writes** to the DB (create/update/delete product), not in the code that reads.

---

### Cache-aside as a reusable function (how it looks in a real app)

```ts
const getProducts = async () => {
  const cacheKey = "products:all";

  // 1. Try the cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached); // HIT

  // 2. MISS → read from DB
  const result = await pool.query("SELECT * FROM products");
  const products = result.rows;

  // 3. Save a copy for next time
  await redisClient.setEx(cacheKey, 60, JSON.stringify(products));

  return products; // return data on MISS too
};
```

**Make Redis optional, not required:** if Redis is down, the request should still work using the DB. Wrap cache calls in `try/catch` and fall back to the DB instead of failing the whole request.

---

### Other caching patterns (for awareness)

| Pattern                        | How it works                                                | When to use                                             |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------- |
| **Cache-aside** (lazy loading) | App checks cache → on miss reads DB and fills cache         | Default choice for read-heavy data                      |
| **Write-through**              | Every write goes to DB **and** cache at the same time       | Cache is always fresh, but writes are slower            |
| **Write-behind** (write-back)  | Write to cache first, DB is updated later in the background | Very fast writes, but data can be lost if cache crashes |

---

### Common problems

| Problem                | What happens                                                           | Simple fix                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Stale data**         | Cache shows old data after DB changed                                  | Delete key on update + use TTL                                                                                   |
| **Cache stampede**     | Popular key expires → many requests miss at once → all hit DB together | Add a little random extra time to TTLs, or let only one request rebuild the cache                                |
| **Memory full**        | Redis RAM is limited                                                   | Always set TTLs; configure `maxmemory` + an eviction policy like `allkeys-lru` (remove least recently used keys) |
| **Caching everything** | Wasted memory, more stale data                                         | Cache only hot, expensive, rarely-changing data                                                                  |

---

### Recap

| Concept                             | Why                                         |
| ----------------------------------- | ------------------------------------------- |
| Cache = copy in RAM                 | Faster reads, less DB load                  |
| Cache-aside                         | App checks cache first, fills it on a miss  |
| HIT / MISS                          | Found in cache / must read from DB          |
| TTL (`setEx`)                       | Old copies expire automatically             |
| Stale cache                         | DB changed but cache still has the old copy |
| Invalidation (`del` after DB write) | Users don't see stale data                  |
| `JSON.stringify` / `JSON.parse`     | Redis stores text, not objects              |
| Input in the cache key              | Different requests don't share wrong data   |
| Fallback to DB                      | App still works if Redis is down            |

## Caching in the real app (`src/services/product.service.ts`)

The demo above used a fake "DB" variable. Now the same ideas run inside the real Express + PostgreSQL product API.

### Where does the caching code live?

```
Request ──▶ routes (product.routes.ts) ──▶ controller (product.controller.ts) ──▶ service (product.service.ts)
                                                                                    │
                                                                         ┌──────────┴──────────┐
                                                                       Redis               PostgreSQL
                                                                  (fast copy)          (source of truth)
```

| Layer          | Job                                        | Knows about Redis?    |
| -------------- | ------------------------------------------ | --------------------- |
| **Route**      | Maps URL + method to a controller function | ❌                    |
| **Controller** | Reads `req`, validates input, sends `res`  | ❌                    |
| **Service**    | Business logic + data access               | ✅ caching lives here |

**Why the service layer?**

- The controller doesn't care _where_ data comes from. It calls `getProductById(5)` and gets a product, whether it was a HIT or a MISS.
- All cache reads **and** all cache deletes are in one file. When you add a new write function, the invalidation code is right next to it, so it's harder to forget.

---

### Endpoints and what each one does with Redis

| Endpoint                              | Service function   | Redis action                                    |
| ------------------------------------- | ------------------ | ----------------------------------------------- |
| `GET /products`                       | `getAllProducts()` | Read `products:all` (cache-aside)               |
| `GET /products?category=..&search=..` | `getAllProducts()` | **Skip the cache**, go to DB                    |
| `GET /products/:id`                   | `getProductById()` | Read `product:id:<id>` (cache-aside)            |
| `POST /products`                      | `createProduct()`  | Delete `products:all`                           |
| `PATCH /products/:id`                 | `updateProduct()`  | Delete `product:id:<id>` **and** `products:all` |

---

### Complete code (read this first)

This is the whole `src/services/product.service.ts`. The `STEP` comments match the step headings below, where each part is explained.

```ts
import { pool } from "../db/pool";
import { redisClient } from "../redis/client";
import {
  Product,
  ProductRow,
  CreateProductInput,
  UpdateProductInput,
} from "../types/product";

// DB row (snake_case, Date, price as string) → API object (camelCase, plain JSON values)
// Runs BEFORE caching, so the cached copy and the DB result have the same shape (STEP 4)
function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    stock: row.stock,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// ───────────── STEP 1: cache keys + TTL ─────────────
const PRODUCTS_ALL_CACHE_KEY = "products:all";
const PRODUCTS_CACHE_TTL_SECONDS = 60;

const getProductCacheKey = (productId: number): string => {
  return `product:id:${productId}`; // e.g. "product:id:5"
};

// ───────────── STEP 2: DB-only function (no Redis) ─────────────
export async function fetchAllProductsFromDatabase(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  let query = "SELECT * FROM products WHERE 1=1"; // 1=1 → every filter can start with "AND"
  const values: string[] = [];

  if (filters.category) {
    values.push(filters.category);
    query += ` AND LOWER(category) = LOWER($${values.length})`;
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    query += ` AND (LOWER(name) LIKE LOWER($${values.length}) OR LOWER(description) LIKE LOWER($${values.length}))`;
  }

  query += " ORDER BY id ASC";

  const result = await pool.query<ProductRow>(query, values);
  return result.rows.map(mapProductRow);
}

// ───────────── STEP 3: cached list (cache-aside) ─────────────
export async function getAllProducts(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const hasFilters = Boolean(filters?.category || filters?.search);

  // Filtered lists are NOT cached → go straight to DB
  if (hasFilters) {
    console.log("Cache bypass: Filtered product list");
    return fetchAllProductsFromDatabase(filters);
  }

  const cachedProducts = await redisClient.get(PRODUCTS_ALL_CACHE_KEY);

  if (cachedProducts) {
    console.log("Cache hit: products:all");
    return JSON.parse(cachedProducts) as Product[]; // HIT → text back to array
  } else {
    console.log("Cache miss: products:all");
    const products = await fetchAllProductsFromDatabase(filters); // MISS → DB

    await redisClient.setEx(
      PRODUCTS_ALL_CACHE_KEY,
      PRODUCTS_CACHE_TTL_SECONDS,
      JSON.stringify(products),
    );
    console.log("Cache set: products:all");

    return products;
  }
}

// ───────────── STEP 2: DB-only function (no Redis) ─────────────
export async function fetchSingleProduct(id: number): Promise<Product | null> {
  const result = await pool.query<ProductRow>(
    "SELECT * FROM products WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapProductRow(result.rows[0]);
}

// ───────────── STEP 4: cached single product (cache-aside) ─────────────
export async function getProductById(id: number): Promise<Product | null> {
  const cacheKey = getProductCacheKey(id);

  const cache = await redisClient.get(cacheKey);

  if (cache) {
    console.log(`Cache hit: ${cacheKey}`);
    return JSON.parse(cache); // HIT
  } else {
    console.log(`Cache Miss: ${cacheKey}`);

    const product = await fetchSingleProduct(id); // MISS → DB

    if (!product) {
      return null; // not found → don't cache
    }

    await redisClient.setEx(
      cacheKey,
      PRODUCTS_CACHE_TTL_SECONDS,
      JSON.stringify(product),
    );
    console.log(`Cache set: ${cacheKey}`);

    return product;
  }
}

// ───────────── STEP 5: invalidation helper (list) ─────────────
const deleteAllProductsCache = async (): Promise<void> => {
  await redisClient.del(PRODUCTS_ALL_CACHE_KEY);
  console.log(`Cache delete: ${PRODUCTS_ALL_CACHE_KEY}`);
};

// ───────────── STEP 6: create → invalidate list ─────────────
export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const result = await pool.query<ProductRow>( // 1. write DB first (STEP 7)
    `
    INSERT INTO products (name, description, price, category, stock)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [input.name, input.description, input.price, input.category, input.stock],
  );

  await deleteAllProductsCache(); // 2. then delete list cache

  return mapProductRow(result.rows[0]);
}

// ───────────── STEP 5: invalidation helper (single) ─────────────
const deleteSingleProductCache = async (productId: number): Promise<void> => {
  const cacheKey = getProductCacheKey(productId);
  await redisClient.del(cacheKey);
  console.log(`Cache delete: ${cacheKey}`);
};

// ───────────── STEP 6: update → invalidate single + list ─────────────
export async function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<Product | null> {
  const existing = await fetchSingleProduct(id); // fresh row from DB, NOT cache (STEP 2)
  if (!existing) {
    return null;
  }

  // PATCH: fields not sent keep their current value
  const name = input.name ?? existing.name;
  const description = input.description ?? existing.description;
  const price = input.price ?? existing.price;
  const category = input.category ?? existing.category;
  const stock = input.stock ?? existing.stock;

  const result = await pool.query<ProductRow>( // 1. write DB first (STEP 7)
    `
    UPDATE products
    SET name = $1,
        description = $2,
        price = $3,
        category = $4,
        stock = $5,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
    `,
    [name, description, price, category, stock, id],
  );

  await deleteSingleProductCache(id); // 2. delete product:id:<id>
  await deleteAllProductsCache(); // 3. delete products:all

  return mapProductRow(result.rows[0]);
}
```

**Flow summary**

```
GET  /products          → getAllProducts   → Redis "products:all"  → (miss) DB → setEx
GET  /products?search=… → getAllProducts   → DB only (bypass)
GET  /products/:id      → getProductById   → Redis "product:id:N"  → (miss) DB → setEx
POST /products          → createProduct    → DB INSERT → DEL products:all
PATCH /products/:id     → updateProduct    → DB SELECT → DB UPDATE → DEL product:id:N + products:all
```

---

### Step 1: Constants and the key builder

```ts
const PRODUCTS_ALL_CACHE_KEY = "products:all";
const PRODUCTS_CACHE_TTL_SECONDS = 60;

const getProductCacheKey = (productId: number): string => {
  return `product:id:${productId}`;
};
```

- **Why constants?** The same key is used to **read** (in `getAllProducts`) and to **delete** (in `deleteAllProductsCache`). With one constant, a typo can't make the read use `products:all` and the delete use `product:all`. That kind of typo is a silent bug: the delete removes nothing and users see stale data.
- **Why a function for the single-product key?** The key depends on the id. One function = one place that decides the key format. Reads and deletes always build the exact same string.
- **Why `product:id:5` and not just `5`?** Namespacing. Later, Redis will also hold rate-limit counters, sessions, queues… `5` alone could mean anything.
- **One TTL for both** keeps it simple. In real apps you can use different TTLs (e.g. list = 60s, single product = 5 min).

---

### Step 2: Separate "DB only" functions from "cached" functions

```
getAllProducts()   ──(miss)──▶ fetchAllProductsFromDatabase()   ← only SQL, no Redis
getProductById()   ──(miss)──▶ fetchSingleProduct()             ← only SQL, no Redis
```

**Why split them?**

- The cached function = "check Redis → otherwise call the DB function → save".
- The DB function = "just run the SQL". It can be reused anywhere you **must** have fresh data.
- Example: `updateProduct()` calls `fetchSingleProduct()` directly, **not** `getProductById()`.
  - **Why?** Before writing, you want the real current row from the source of truth. If you read the cached copy, you might merge the update with old values (e.g. an old price that was already changed).

> 💡 Rule: **reads for users may come from the cache. Reads that are used to make a write should come from the DB.**

---

### Step 3: `getAllProducts()`: list cache + bypass for filters

```ts
export async function getAllProducts(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const hasFilters = Boolean(filters?.category || filters?.search);

  if (hasFilters) {
    console.log("Cache bypass: Filtered product list");
    return fetchAllProductsFromDatabase(filters); // 1. filtered → always DB
  }

  const cachedProducts = await redisClient.get(PRODUCTS_ALL_CACHE_KEY);

  if (cachedProducts) {
    console.log("Cache hit: products:all");
    return JSON.parse(cachedProducts) as Product[]; // 2. HIT → return copy
  } else {
    console.log("Cache miss: products:all");
    const products = await fetchAllProductsFromDatabase(filters); // 3. MISS → DB

    await redisClient.setEx(
      PRODUCTS_ALL_CACHE_KEY,
      PRODUCTS_CACHE_TTL_SECONDS,
      JSON.stringify(products),
    );
    console.log("Cache set: products:all");

    return products;
  }
}
```

**Why bypass the cache when filters are used?**

The result depends on the filter. If every request used the key `products:all`:

```
GET /products?category=books    → MISS → caches ONLY books under "products:all"
GET /products                   → HIT  → returns only books ❌ wrong data!
```

To cache filtered results, the filter must be part of the key:

```
products:all
products:all:category:books
products:all:search:keyboard
products:all:category:books:search:harry
...  (one key per combination → can be many keys)
```

That causes two problems:

1. **Many keys:** users can type any search text → endless combinations, most of them never asked twice → low hit ratio, wasted memory.
2. **Hard invalidation:** when a product changes, which filtered keys are now wrong? You don't know, so you'd have to delete **all** `products:all:*` keys.

So the simple choice here: **cache only the most common request (no filters), send filtered requests straight to the DB.** That's a valid, real-world trade-off: cache the "hot path", not everything.

> 💡 If you later want to cache filters, normalize the input first (`category.toLowerCase().trim()`), so `Books` and ` books` share one key. See "Invalidating many keys at once" below.

---

### Step 4: `getProductById()`: one key per product

```ts
export async function getProductById(id: number): Promise<Product | null> {
  const cacheKey = getProductCacheKey(id); // "product:id:5"
  const cache = await redisClient.get(cacheKey);

  if (cache) {
    console.log(`Cache hit: ${cacheKey}`);
    return JSON.parse(cache);
  } else {
    console.log(`Cache Miss: ${cacheKey}`);
    const product = await fetchSingleProduct(id);

    if (!product) {
      return null; // not found → nothing cached
    }

    await redisClient.setEx(
      cacheKey,
      PRODUCTS_CACHE_TTL_SECONDS,
      JSON.stringify(product),
    );
    console.log(`Cache set: ${cacheKey}`);
    return product;
  }
}
```

- **Why one key per product, not one big "all products" object?** A request for product 5 only reads product 5. And when product 5 changes, only `product:id:5` is deleted. Products 1–4 stay cached.
- **Why `return null` before `setEx`?** If the product doesn't exist, there's nothing to cache. `JSON.stringify(null)` would store `"null"`. Then the next `get` returns the string `"null"`, which is truthy, so it would count as a "HIT" and return `null`. It would work by accident, but it is confusing. Not caching "not found" keeps it clear.
  - Trade-off: someone requesting a non-existing id again and again hits the DB every time. See **cache penetration** below.
- **Why JSON is safe here:** `mapProductRow()` already turns `created_at` (a `Date`) into an ISO **string** and `price` into a **number** _before_ caching. So the object from the cache (`JSON.parse`) looks exactly like the one from the DB.

> ⚠️ **JSON and `Date`:** `JSON.stringify(new Date())` → a string. `JSON.parse` does **not** turn it back into a `Date`. If you cache raw DB rows with `Date` fields, a HIT gives you strings and a MISS gives you `Date` objects, so the same function returns different types. Map to plain JSON-friendly values **before** caching, as this code does.

---

### Step 5: Invalidation helpers

```ts
const deleteAllProductsCache = async (): Promise<void> => {
  await redisClient.del(PRODUCTS_ALL_CACHE_KEY);
  console.log(`Cache delete: ${PRODUCTS_ALL_CACHE_KEY}`);
};

const deleteSingleProductCache = async (productId: number): Promise<void> => {
  const cacheKey = getProductCacheKey(productId);
  await redisClient.del(cacheKey);
  console.log(`Cache delete: ${cacheKey}`);
};
```

- `DEL` on a key that doesn't exist is fine. It just returns `0`, no error. So you can always delete safely without checking `EXISTS` first.
- Small helpers = the invalidation logic has a name. `updateProduct` reads like a sentence: "update DB, delete single cache, delete list cache".

---

### Step 6: Which write must delete which key? (the most important part)

Ask for every write: **"Which cached copies contain the data I just changed?"** Delete exactly those.

| Write                                | `products:all` (list) | `product:id:<id>` (single) | Why                                                                                   |
| ------------------------------------ | --------------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| **Create** product                   | 🗑 delete             | — leave                    | The list is now missing the new product. No single key exists yet for a brand-new id. |
| **Update** product                   | 🗑 delete             | 🗑 delete                  | The product is inside the list **and** has its own key. Both copies are old.          |
| **Delete** product _(not built yet)_ | 🗑 delete             | 🗑 delete                  | Otherwise the deleted product still shows up from the cache for up to 60s.            |

**`createProduct()`**

```ts
const result = await pool.query(`INSERT INTO products ... RETURNING *`, [...])  // 1. DB first
await deleteAllProductsCache()                                                  // 2. then cache
return mapProductRow(result.rows[0])
```

**`updateProduct()`**

```ts
const existing = await fetchSingleProduct(id)          // fresh row from DB (not cache)
if (!existing) return null                             // 404 → nothing changed → nothing to invalidate

// ?? keeps the old value for fields not sent in the PATCH body
const name = input.name ?? existing.name
...
const result = await pool.query(`UPDATE products SET ... WHERE id = $6 RETURNING *`, [...])

await deleteSingleProductCache(id)                     // product:id:<id>
await deleteAllProductsCache()                         // products:all
return mapProductRow(result.rows[0])
```

> ⚠️ **Easy bug to make:** deleting only the single key on update. Then `GET /products/5` shows the new price, but `GET /products` still shows the old price for 60s. **One piece of data can live in many cache keys.** Invalidate all of them.

> 💡 When you add `DELETE /products/:id`, copy the update pattern: delete from DB, then `deleteSingleProductCache(id)` + `deleteAllProductsCache()`.

---

### Step 7: Why "DB first, then delete cache" (and not the other way round)

**❌ Delete cache first, then write DB:**

```
1. Writer:  DEL product:id:5
2. Reader:  GET product:id:5 → MISS → reads DB → gets OLD price (DB not updated yet)
3. Reader:  SETEX product:id:5 (OLD price)          ← stale copy saved again
4. Writer:  UPDATE products SET price = NEW
→ cache has the OLD price until TTL expires
```

The gap between step 1 and 4 is relatively large (a whole DB query), so this goes wrong easily.

**✅ Write DB first, then delete cache** (what our code does):

```
1. Writer:  UPDATE products SET price = NEW
2. Writer:  DEL product:id:5
3. Reader:  MISS → reads DB → NEW price → caches it ✅
```

**Is it 100% safe?** Almost. One rare race is still possible:

```
1. Reader:  MISS → reads DB → gets OLD price ... (slow)
2. Writer:  UPDATE DB → DEL cache
3. Reader:  SETEX with OLD price                    ← stale again
```

This needs the reader to be slower than a whole write + delete, so it is rare. The **TTL** is the safety net: the stale copy dies after 60s anyway. This is why you **always** set a TTL, even when you also invalidate.

**What if the DB write succeeds but `DEL` fails** (Redis briefly down)? The error goes to the error middleware, but the DB already changed. The cache stays stale until the TTL. Again: TTL = safety net.

---

### Step 8: Try it yourself

Terminal 1, watch every command Redis receives:

```bash
docker exec -it redis_course_redis redis-cli MONITOR
```

Terminal 2:

```bash
npm run dev

curl localhost:5000/products            # Cache miss: products:all → Cache set
curl localhost:5000/products            # Cache hit: products:all
curl "localhost:5000/products?category=accessories"   # Cache bypass

curl localhost:5000/products/1          # Cache Miss: product:id:1 → Cache set
curl localhost:5000/products/1          # Cache hit: product:id:1

curl -X PATCH localhost:5000/products/1 \
  -H "Content-Type: application/json" -d '{"price": 999}'
                                        # Cache delete: product:id:1
                                        # Cache delete: products:all

curl localhost:5000/products/1          # Cache Miss → fresh price 999 ✅
```

Inspect keys in `redis-cli`:

```
KEYS product*            → "products:all", "product:id:1"   (dev only, see warning below)
TTL product:id:1         → 54
GET product:id:1         → "{\"id\":1,\"name\":...,\"price\":999,...}"
```

---

## Extra caching concepts (not in the code yet, but important)

### 1. Redis should not take the app down (graceful fallback)

Right now, if Redis is down, `redisClient.get()` throws → the request fails with 500, even though PostgreSQL is fine.

The cache is an **optimization**, so a cache error should mean "slower", not "broken":

```ts
async function getCache(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error(`Cache read failed for ${key}`, error);
    return null; // behave like a MISS → app falls back to DB
  }
}
```

Do the same for `setEx` (ignore failure, data is already returned) and `del` (log it; TTL will clean up).

### 2. A reusable cache-aside helper

`getAllProducts` and `getProductById` repeat the same steps. That can be pulled into one function:

```ts
async function getOrSetCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as T; // HIT

  const fresh = await fetchFn(); // MISS
  if (fresh !== null && fresh !== undefined) {
    await redisClient.setEx(key, ttl, JSON.stringify(fresh));
  }
  return fresh;
}

// usage
getOrSetCache(getProductCacheKey(id), 60, () => fetchSingleProduct(id));
```

### 3. Delete several keys in one round trip

`DEL` accepts many keys. One network call instead of two:

```ts
await redisClient.del([getProductCacheKey(id), PRODUCTS_ALL_CACHE_KEY]);
```

### 4. Invalidating many keys at once (when you cache filtered lists)

If you cache `products:all:category:books`, `products:all:search:mouse`, … you need to delete them all on any product change.

| Option                       | How                                                                                                                  | Note                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `KEYS products:all*` + `DEL` | Find all matching keys                                                                                               | ❌ **Never in production.** `KEYS` scans every key and **blocks** Redis (single-threaded) while it runs. |
| `SCAN` + `DEL`               | Walks keys in small batches                                                                                          | ✅ Doesn't block Redis.                                                                                  |
| **Tracking Set**             | When caching a filtered key, also `SADD products:list-keys <key>`. On invalidation, `SMEMBERS` → `DEL` all + the set | ✅ No scanning                                                                                           |
| **Version in the key**       | Store `products:version = 7`; keys look like `products:v7:category:books`. On change: `INCR products:version`        | ✅ One command invalidates everything; old keys just expire via TTL                                      |

```ts
// SCAN version (node-redis v5+ yields batches of keys)
for await (const keys of redisClient.scanIterator({
  MATCH: "products:all*",
  COUNT: 100,
})) {
  if (keys.length) await redisClient.del(keys);
}
```

### 5. Cache problems with names (interview favourites)

| Problem                        | What happens                                                                                                                               | Fix                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Cache penetration**          | Requests for data that **doesn't exist** (e.g. `/products/999999`) are never cached → every request hits the DB. Attackers can abuse this. | Cache "not found" for a short time (**negative caching**, e.g. store `"__NULL__"` for 30s), validate ids early, rate limit. |
| **Cache stampede / breakdown** | One **hot** key (`products:all`) expires → 1000 requests miss at the same moment → 1000 identical DB queries.                              | A lock so only one request rebuilds (`SET lock:key 1 NX EX 5`), others wait/retry; or refresh before expiry.                |
| **Cache avalanche**            | **Many** keys expire at the same time (e.g. all cached at startup with TTL 60) → DB gets flooded.                                          | Add random **jitter** to TTL: `60 + Math.floor(Math.random() * 30)`.                                                        |
| **Stale data**                 | Cache doesn't match DB                                                                                                                     | Invalidate on write + TTL (done ✅).                                                                                        |

**Negative caching sketch:**

```ts
const NOT_FOUND = "__NULL__";
if (cache === NOT_FOUND) return null; // cached "not found"
if (!product) {
  await redisClient.setEx(cacheKey, 30, NOT_FOUND); // short TTL
  return null;
}
```

> Then `createProduct` must also delete that key if a product with that id is created later. With auto-increment ids that rarely matters, but it's another reason to keep the "not found" TTL short.

### 6. Delete-on-write vs update-on-write

Our code **deletes** the cache on write (cache-aside invalidation). The alternative is to **write the new value** into the cache right after the DB update (**write-through** style):

```ts
await redisClient.setEx(
  getProductCacheKey(id),
  60,
  JSON.stringify(updatedProduct),
);
```

|                  | Delete on write ✅ (ours) | Update on write                                                         |
| ---------------- | ------------------------- | ----------------------------------------------------------------------- |
| Next read        | MISS (one DB query)       | HIT                                                                     |
| Risk             | Very low                  | Two writers at the same time can leave the **older** value in the cache |
| Works for lists? | Yes, just delete          | Hard: you'd have to rebuild/patch the whole list                        |

Deleting is the safer default. Update-on-write is an optimization for very hot single keys.

### 7. Be careful what you cache

- `stock` is inside the cached product. For **showing** a product, a 60s-old stock number is fine. For **checkout** ("is it still in stock?"), always read the DB (or use atomic Redis counters like `DECR`), never the cache.
- Never cache per-user private data under a shared key (e.g. `cart` instead of `cart:user:7`). One user would see another user's data.

### 8. Measure it

- Log HIT / MISS (done ✅). In production you'd count them (metrics) to see the **hit ratio**.
- `redis-cli INFO stats` → `keyspace_hits` and `keyspace_misses` for the whole Redis server.
- Compare response time of a MISS vs a HIT to see the gain.

---

### Complete improved version (all extras together)

The same `product.service.ts`, rewritten with the improvements above. **Not in the project yet**: use it as a reference if you want to upgrade your code.

What changed compared to the current code:
| # | Change | Concept |
|---|---|---|
| 1 | `safeGet` / `safeSetEx` / `safeDel` wrap Redis in `try/catch` | Redis down → app still works (fallback) |
| 2 | `getOrSetCache()` holds the cache-aside steps once | Reusable helper, no repeated code |
| 3 | `ttlWithJitter()` adds 0–14 random seconds | Prevents cache avalanche |
| 4 | `invalidateProductCache()` deletes both keys in one `DEL` | One round trip |
| 5 | New `deleteProduct()` | Delete also invalidates list + single |

## Example

```ts
import { pool } from "../db/pool";
import { redisClient } from "../redis/client";
import {
  Product,
  ProductRow,
  CreateProductInput,
  UpdateProductInput,
} from "../types/product";

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    stock: row.stock,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// ───────────── Cache keys + TTL ─────────────
const PRODUCTS_ALL_CACHE_KEY = "products:all";
const PRODUCTS_CACHE_TTL_SECONDS = 60;

const getProductCacheKey = (productId: number): string =>
  `product:id:${productId}`;

// 60–74s, so keys cached at the same moment don't all expire together (avalanche)
const ttlWithJitter = (): number =>
  PRODUCTS_CACHE_TTL_SECONDS + Math.floor(Math.random() * 15);

// ───────────── Safe Redis wrappers: a Redis error never fails the request ─────────────
async function safeGet(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error(`Cache read failed: ${key}`, error);
    return null; // treat as MISS → DB
  }
}

async function safeSetEx(
  key: string,
  ttl: number,
  value: string,
): Promise<void> {
  try {
    await redisClient.setEx(key, ttl, value);
  } catch (error) {
    console.error(`Cache write failed: ${key}`, error); // data is still returned to user
  }
}

async function safeDel(keys: string[]): Promise<void> {
  try {
    await redisClient.del(keys); // many keys, one command
    console.log(`Cache delete: ${keys.join(", ")}`);
  } catch (error) {
    console.error(`Cache delete failed: ${keys.join(", ")}`, error); // TTL cleans up later
  }
}

// ───────────── Reusable cache-aside helper ─────────────
async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cached = await safeGet(key);

  if (cached) {
    console.log(`Cache hit: ${key}`);
    return JSON.parse(cached) as T;
  }

  console.log(`Cache miss: ${key}`);
  const fresh = await fetchFn();

  if (fresh !== null && fresh !== undefined) {
    // don't cache "not found"
    await safeSetEx(key, ttlWithJitter(), JSON.stringify(fresh));
    console.log(`Cache set: ${key}`);
  }

  return fresh;
}

// ───────────── Invalidation ─────────────
// Pass an id when one product changed (update/delete); no id for create
async function invalidateProductCache(productId?: number): Promise<void> {
  const keys = [PRODUCTS_ALL_CACHE_KEY];
  if (productId !== undefined) keys.push(getProductCacheKey(productId));
  await safeDel(keys);
}

// ───────────── DB-only functions ─────────────
export async function fetchAllProductsFromDatabase(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  let query = "SELECT * FROM products WHERE 1=1";
  const values: string[] = [];

  if (filters.category) {
    values.push(filters.category);
    query += ` AND LOWER(category) = LOWER($${values.length})`;
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    query += ` AND (LOWER(name) LIKE LOWER($${values.length}) OR LOWER(description) LIKE LOWER($${values.length}))`;
  }

  query += " ORDER BY id ASC";

  const result = await pool.query<ProductRow>(query, values);
  return result.rows.map(mapProductRow);
}

export async function fetchSingleProduct(id: number): Promise<Product | null> {
  const result = await pool.query<ProductRow>(
    "SELECT * FROM products WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapProductRow(result.rows[0]);
}

// ───────────── Reads (cached) ─────────────
export async function getAllProducts(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  if (filters?.category || filters?.search) {
    console.log("Cache bypass: Filtered product list");
    return fetchAllProductsFromDatabase(filters);
  }

  return getOrSetCache(PRODUCTS_ALL_CACHE_KEY, () =>
    fetchAllProductsFromDatabase({}),
  );
}

export async function getProductById(id: number): Promise<Product | null> {
  return getOrSetCache(getProductCacheKey(id), () => fetchSingleProduct(id));
}

// ───────────── Writes (DB first, then invalidate) ─────────────
export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const result = await pool.query<ProductRow>(
    `
    INSERT INTO products (name, description, price, category, stock)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [input.name, input.description, input.price, input.category, input.stock],
  );

  await invalidateProductCache(); // list only

  return mapProductRow(result.rows[0]);
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<Product | null> {
  const existing = await fetchSingleProduct(id); // DB, not cache
  if (!existing) {
    return null;
  }

  const name = input.name ?? existing.name;
  const description = input.description ?? existing.description;
  const price = input.price ?? existing.price;
  const category = input.category ?? existing.category;
  const stock = input.stock ?? existing.stock;

  const result = await pool.query<ProductRow>(
    `
    UPDATE products
    SET name = $1,
        description = $2,
        price = $3,
        category = $4,
        stock = $5,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
    `,
    [name, description, price, category, stock, id],
  );

  await invalidateProductCache(id); // list + single

  return mapProductRow(result.rows[0]);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return false; // nothing deleted → nothing to invalidate
  }

  await invalidateProductCache(id); // list + single

  return true;
}
```

To use `deleteProduct`, you would also add a controller function and the route `router.delete("/:id", productController.deleteProduct)`.

> 💡 Negative caching (caching "not found") is left out here to keep `getOrSetCache` simple. See point 5 above if you want to add it.

---

### Recap: caching in the product API

| Concept                                | In our code                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| Caching lives in the **service layer** | `product.service.ts`; controllers don't know Redis exists                                  |
| Key constants + key builder            | `PRODUCTS_ALL_CACHE_KEY`, `getProductCacheKey(id)` → read & delete always use the same key |
| DB-only functions                      | `fetchAllProductsFromDatabase`, `fetchSingleProduct`, reused for writes (fresh data)       |
| Cache the hot path only                | No-filter list is cached; filtered lists bypass the cache                                  |
| Per-item keys                          | `product:id:<id>` → change one product, delete one key                                     |
| Don't cache "not found"                | `return null` before `setEx`                                                               |
| Map before caching                     | Dates become strings before `JSON.stringify`, so HIT and MISS return the same shape        |
| Invalidate every copy                  | Create → list; Update/Delete → list **+** single                                           |
| Order                                  | DB write first, then `DEL`                                                                 |
| TTL always                             | Safety net for races and failed deletes                                                    |
| Fallback (to add)                      | Redis error → treat as MISS, read DB                                                       |

## Rate Limit Using Redis

### 1. What is rate limiting?

Rate limiting **restricts how many requests a client can make to an API within a time period**.

Examples of limits:
| Limit | Typical use |
|---|---|
| 5 requests / minute / IP address | Public read endpoints |
| 100 requests / hour / logged-in user | Authenticated APIs |
| 3 login attempts / minute / account | Login, OTP, password reset |

When a client goes over its limit, the server rejects the extra requests with **HTTP `429 Too Many Requests`**.

**Why do we need it?**

- Protect the API from too much traffic (traffic spikes, buggy clients, bots).
- Make brute-force attacks (password guessing, OTP guessing) slower and harder.
- Stop accidental or intentional API abuse (scraping, spam).
- Control resource usage: protect expensive DB queries and paid third-party API calls.
- Keep the app stable for everyone. One noisy client should not slow down other users.

---

### 2. Why use Redis for rate limiting?

Suppose we store the counters in a plain JavaScript object:

```ts
const requestCounts: Record<string, number> = {};
```

Problems with this:
| Problem | What happens |
|---|---|
| Lost on restart | Counters disappear when the Node.js process restarts or redeploys |
| Not shared | Each app instance keeps its **own** counters |
| No expiry | You must write your own timers / cleanup code to reset counters |
| Memory leak risk | Old IPs stay in the object forever unless you clean them up |

Redis solves all of these. It is a **shared, in-memory store** with **atomic counters** (`INCR`) and **automatic expiry** (`EXPIRE`).

**Example: multiple app instances behind a load balancer**

```
                       ┌──────────▶ Server A ──┐
Client ──▶ Load balancer ───────▶ Server B ───┼──▶ Redis   rateLimit:products:1.2.3.4 = 4
                       └──────────▶ Server C ──┘          (one shared counter)
```

- **Without a shared store:** each server allows 5 requests, so a limit of 5 really becomes **15** (5 × 3 servers).
- **With Redis:** all servers increment the **same key**, so the limit is really 5. This works as long as all servers use the same key format and the same limits.

---

### 3. How it works: the fixed-window counter

Our implementation uses the **fixed-window counter** algorithm.

```ts
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;
```

→ Each client IP can make **up to 5 requests in a 60-second window**.

**Request lifecycle**

1. A request reaches the Express server.
2. The middleware finds the client's IP address.
3. It builds a unique Redis key: `rateLimit:products:<ip>`.
4. Redis increments the counter for that key (`INCR`).
5. If this is the **first** request of the window (count = 1), it sets a 60s expiry (`EXPIRE`).
6. The middleware checks the count.
7. Count **> 5** → respond with `429`. Otherwise → call `next()` and the request goes to the controller.
8. After 60 seconds Redis deletes the key automatically, and the next request starts a new window at 1.

**Flow diagram**

```
Incoming Request
       │
       ▼
Identify Client IP
       │
       ▼
Construct Redis Key  →  rateLimit:products:<ip>
       │
       ▼
INCR counter
       │
       ▼
First request? (count === 1)
   ┌───┴────┐
  Yes       No
   │        │
   ▼        │
EXPIRE 60s  │
   └───┬────┘
       ▼
Set X-RateLimit-* headers
       │
   ┌───┴──────────┐
count <= 5     count > 5
   │              │
   ▼              ▼
 next()        HTTP 429
   │
   ▼
Controller
```

**Timeline example (limit = 5, window = 60s)**
| Time | Request # | Redis value | TTL | Result |
|---|---|---|---|---|
| 0s | 1 | 1 | set to 60 | ✅ allowed |
| 5s | 2 | 2 | 55 | ✅ allowed |
| 10s–20s | 3, 4, 5 | 3, 4, 5 | 50 → 40 | ✅ allowed |
| 25s | 6 | 6 | 35 | ❌ 429 |
| 60s | (key expires) | gone | | |
| 61s | 7 | 1 (new window) | set to 60 | ✅ allowed |

> 💡 Blocked requests still run `INCR`. The counter keeps going up (6, 7, 8…), but this is harmless: the TTL was set only once, so the key still expires on time.

---

### 4. Our code (`src/middleware/rateLimit.middleware.ts`)

```ts
import { Request, Response, NextFunction } from "express";
import { redisClient } from "../redis/client";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

// Product reads should stay available if Redis is down (fail-open).
// For login / OTP / payments, set this to false (fail-closed).
const FAIL_OPEN = true;

export const productRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Each IP gets its own counter, so one user crossing the limit does not block other users.
  const ip = req.ip ?? req.socket.remoteAddress;

  // Don't fall back to a shared key like "unknown"
  if (!ip) {
    return res.status(400).json({
      success: false,
      message: "Unable to identify client.",
    });
  }

  const rateLimiterKey = `rateLimit:products:${ip}`;

  try {
    const requestCount = await redisClient.incr(rateLimiterKey);

    // After 60 seconds, Redis deletes the key and counting starts fresh
    if (requestCount === 1) {
      await redisClient.expire(rateLimiterKey, RATE_LIMIT_WINDOW_SECONDS);
    }

    // Seconds left in the current window
    const ttl = await redisClient.ttl(rateLimiterKey);
    const secondsUntilReset = Math.max(0, ttl);

    res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount),
    );
    res.setHeader("X-RateLimit-Reset", secondsUntilReset);

    if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
      res.setHeader("Retry-After", secondsUntilReset);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${secondsUntilReset} seconds.`,
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit redis error", error);

    if (FAIL_OPEN) {
      return next();
    }

    next(error);
  }
};
```

> 💡 The file also contains a commented-out Lua version of the `INCR` / `EXPIRE` / `TTL` part. See section 8.

**Line by line**
| Code | Why |
|---|---|
| `req.ip ?? req.socket.remoteAddress` | `req.ip` is Express's client IP (respects the `trust proxy` setting). The socket address is a fallback. |
| `if (!ip) → 400` | Without an IP, every such request would share the key `rateLimit:products:undefined`. Reject instead. |
| `` `rateLimit:products:${ip}` `` | Namespaced key: _feature_ : _scope_ : _client_. You can add `rateLimit:login:<ip>` later without collisions. |
| `redisClient.incr(key)` | Atomic +1. If the key doesn't exist, Redis treats it as `0` and returns `1`. |
| `if (requestCount === 1) expire(...)` | Set the TTL **only once**, at the start of the window. If we set it on every request, the window would keep moving forward and an active client would never be reset. |
| `redisClient.ttl(key)` | Seconds left in the window. `Math.max(0, …)` guards against the `-1` / `-2` special values. |
| `X-RateLimit-Limit` / `-Remaining` / `-Reset` | Tell the client its limit, how many requests are left, and when the window resets. `Math.max(0, …)` prevents negative numbers after the limit. |
| `Retry-After` + `return res.status(429)…` | Tells the blocked client how long to wait. `return` stops the function, so `next()` is never called and the controller never runs. |
| `catch → FAIL_OPEN ? next() : next(error)` | Redis failure → either let the request through (fail-open) or forward to `errorMiddleware` → `500` (fail-closed). See section 9. |

---

### 5. Using the middleware in routes (`src/routes/product.routes.ts`)

There are two ways to apply it:

```ts
// Option A: rate limit ALL routes in this router
router.use(productRateLimiter);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Option B: rate limit ONE route only
router.get("/", productRateLimiter, productController.getProducts);
router.get("/:id", productController.getProductById);
```

> ⚠️ **Use one option, not both.** If `router.use(productRateLimiter)` **and** `router.get("/", productRateLimiter, …)` are both present, `GET /products` runs the middleware **twice**, so `INCR` runs twice per request. The client gets blocked after about **3** requests instead of 5, and `X-RateLimit-Remaining` jumps by 2.

**Where to put it?**

- Before the controller, so blocked requests never touch the DB or the cache.
- After `express.json()` is fine. Rate limiting doesn't need the body, so you can also put it earlier to skip body parsing for blocked requests.

---

### 6. Redis commands used

| Command              | What it does                                                               | In our code                           |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| `INCR key`           | Atomically adds 1 to an integer. Missing key → starts at 0 → returns 1.    | Count the request                     |
| `EXPIRE key seconds` | Gives a key a time-to-live (TTL). Redis deletes it when the TTL ends.      | Reset the window after 60s            |
| `TTL key`            | Remaining lifetime in seconds. `-1` = no expiry, `-2` = key doesn't exist. | `X-RateLimit-Reset` and `Retry-After` |

**Why is `INCR` atomic important?**
Two requests arrive at the same moment on two servers. With "GET the value → add 1 in JS → SET", both could read `4` and both write `5`, so one request is lost. `INCR` runs inside Redis as one step, so the results are always `5` and `6`.

**Try it in `redis-cli`**

```bash
INCR rateLimit:products:1.2.3.4        # (integer) 1
EXPIRE rateLimit:products:1.2.3.4 60   # (integer) 1
INCR rateLimit:products:1.2.3.4        # (integer) 2
TTL rateLimit:products:1.2.3.4         # (integer) 54
GET rateLimit:products:1.2.3.4         # "2"
KEYS rateLimit:*                       # list all limiter keys (use SCAN in production)
DEL rateLimit:products:1.2.3.4         # reset a client manually
```

---

### 7. Redis key design

```ts
const rateLimiterKey = `rateLimit:products:${ip}`;
```

- **One counter per client per policy.** Different IPs → different keys → one user hitting the limit doesn't block others.
- **Put the policy name in the key** (`products`, `login`, `otp`) so each endpoint can have its own limit.
- Other key ideas: `rateLimit:login:user:<userId>`, `rateLimit:api:apiKey:<key>`.

**Getting the real client IP**

- `req.ip` is the preferred source. `req.socket.remoteAddress` is a fallback.
- Behind a reverse proxy / load balancer (Nginx, AWS ALB, Render, Heroku…), `req.ip` is the **proxy's** IP unless you configure `trust proxy`. Then **all users share one counter**, and one user can block everybody.
  ```ts
  // app.ts: trust exactly one proxy hop in front of the app
  app.set("trust proxy", 1);
  ```
- ⚠️ Don't use `app.set("trust proxy", true)` or read `X-Forwarded-For` yourself unless you control the proxy. A client can send a fake `X-Forwarded-For` header and get a new "IP" (and a new limit) on every request.
- If `ip` is `undefined`, the key becomes `rateLimit:products:undefined`, and all those requests share one counter. Don't use a shared fallback like `"unknown"`. Reject the request or use another identifier.

---

### 8. Improvement (optional): make INCR + EXPIRE atomic with a Lua script

**The problem:** `INCR` and `EXPIRE` are **two separate calls** from Node to Redis.

```
INCR  → 1   ✅
EXPIRE      ❌ (Node crashes / network error in between)
```

The key now has **no TTL**. The counter never resets, and that IP stays **blocked** until someone deletes the key. This is rare, but possible.

**The fix:** Redis can run a small **Lua script** (with the `EVAL` command) that does `INCR` + `EXPIRE` + `TTL` inside Redis.

**Why it is better**

- **Atomic:** Redis runs the whole script as one unit, so nothing can happen in between and it can't be left half-done. No key is ever left without a TTL.
- **Faster:** 1 network round trip instead of 3 (`INCR`, `EXPIRE`, `TTL`).
- **Same result:** the script returns `[requestCount, ttl]`, so the rest of the middleware stays the same.

> 💡 Our middleware keeps a **commented-out** Lua version for reference. The plain `INCR` + `EXPIRE` version is easier to read and is fine while learning.
> Redis only runs **Lua** scripts (not JS or SQL). The JS alternative without Lua is a `MULTI` transaction with `EXPIRE key 60 NX` (Redis 7+).

---

### 9. Redis failure handling: fail-open vs fail-closed

Redis can go down (network problem, connection lost, server restart). Our code chooses with the `FAIL_OPEN` flag:

```ts
catch (error) {
  console.error("Rate limit redis error", error);

  if (FAIL_OPEN) {
    return next();       // fail-open: request continues to the controller
  }

  next(error);           // fail-closed: → errorMiddleware → 500
}
```

| Strategy        | What happens when Redis is down | ✅ Advantage                | ❌ Disadvantage                    | Good for                                |
| --------------- | ------------------------------- | --------------------------- | ---------------------------------- | --------------------------------------- |
| **Fail-closed** | Reject / error the request      | Protection is never skipped | Redis outage = API outage          | Login, OTP, payments, expensive ops     |
| **Fail-open**   | Let the request through         | App stays available         | No rate limiting during the outage | Normal public reads (e.g. product list) |

**Fail-open version**

```ts
catch (error) {
  console.error("Rate limit redis error, allowing request", error);
  next();                // no error → request continues to the controller
}
```

> 💡 Pick a policy **per endpoint** and write it down. Log or monitor these errors so an outage doesn't go unnoticed.
> Note: node-redis queues commands while reconnecting, so a request may **wait** instead of failing fast. Consider a timeout or checking `redisClient.isReady` before calling Redis.

---

### 10. Reusable limiter factory (different limits per route)

Our middleware has the key prefix and limits hard-coded. To use different limits on different routes, wrap the same logic in a function:

```ts
export const createRateLimiter =
  (name: string, maxRequests: number, windowSeconds: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const key = `rateLimit:${name}:${req.ip}`;
    // ...same logic as productRateLimiter, using maxRequests and windowSeconds
  };

router.get(
  "/",
  createRateLimiter("products:read", 100, 60),
  productController.getProducts,
);
router.post(
  "/",
  createRateLimiter("products:write", 10, 60),
  productController.createProduct,
);
```

---

### 11. Try it yourself

```bash
# Send 7 requests: the first 5 return 200, then 429
for i in {1..7}; do
  curl -s -o /dev/null -w "Request $i → %{http_code}\n" http://localhost:3000/products
done

# See the headers
curl -i http://localhost:3000/products
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4
```

Then in `redis-cli`:

```bash
KEYS rateLimit:*                    # find your key (e.g. rateLimit:products:::1 for localhost IPv6)
GET  "rateLimit:products:::1"       # current count
TTL  "rateLimit:products:::1"       # seconds until reset
```

> 💡 On localhost, `req.ip` is often `::1` (IPv6) or `::ffff:127.0.0.1`, so the key looks a bit odd. This is expected.

**Test concurrency:** send many requests at the same time (e.g. `npx autocannon -c 20 -a 20 http://localhost:3000/products`). Exactly 5 should succeed. If more get through, there is a race in your logic.

---

### 12. Fixed window vs sliding window vs token bucket

| Algorithm                  | How it works                                                      | ✅ Advantages                            | ❌ Limitations                    | Redis tools                                     |
| -------------------------- | ----------------------------------------------------------------- | ---------------------------------------- | --------------------------------- | ----------------------------------------------- |
| **Fixed window**           | Count requests in a fixed period (0–60s, 60–120s…)                | Simple, fast, 1 key per client           | Bursts at window edges            | `INCR` + `EXPIRE`                               |
| **Sliding window log**     | Store a timestamp per request, count the ones in the last 60s     | Exact, smooth                            | More memory (1 entry per request) | Sorted set: `ZADD`, `ZREMRANGEBYSCORE`, `ZCARD` |
| **Sliding window counter** | Weighted mix of the current and previous fixed windows            | Smooth, cheap                            | Approximate                       | 2 counters                                      |
| **Token bucket**           | Bucket refills tokens at a steady rate, each request uses 1 token | Allows controlled bursts, smooth average | More config, needs Lua            | Hash (`tokens`, `lastRefill`) + Lua             |

**The fixed-window boundary problem**

```
Limit = 5 / minute
        window 1 (0–60s)        │        window 2 (60–120s)
                     ●●●●● (59s)│(61s) ●●●●●
                                │
            10 requests in ~2 seconds, and all are allowed!
```

A client can send up to **2× the limit** in a short burst around the boundary. For most APIs this is acceptable. For strict limits, use a sliding window or token bucket.

**Sliding window log (idea)**

```ts
const now = Date.now();
const key = `rateLimit:sliding:${ip}`;

await redisClient
  .multi()
  .zRemRangeByScore(key, 0, now - WINDOW_MS) // drop entries older than the window
  .zAdd(key, { score: now, value: `${now}-${Math.random()}` })
  .zCard(key) // how many in the last WINDOW_MS
  .pExpire(key, WINDOW_MS)
  .exec();
```

---

### 13. Response headers

| Header                  | Meaning                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `X-RateLimit-Limit`     | Max requests in the window                                                       |
| `X-RateLimit-Remaining` | Requests left in the current window                                              |
| `X-RateLimit-Reset`     | Seconds (or a timestamp) until the window resets                                 |
| `Retry-After`           | Sent with `429`: how many seconds to wait before retrying (standard HTTP header) |

> 💡 The newer IETF draft uses `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (no `X-` prefix). Libraries like `express-rate-limit` can send either style.
> If you call the API from a browser on another origin, add these headers to CORS `exposedHeaders` so frontend JS can read them.

---

### 14. Production best practices

| Practice                              | Why                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Use atomic operations**             | Lua script / `MULTI` so a counter is never left without a TTL                                                            |
| **Configure `trust proxy` correctly** | `req.ip` must be the real client, not the load balancer or a spoofed header                                              |
| **No shared fallback key**            | Don't put all unknown clients under `"unknown"` / `undefined`                                                            |
| **Different limits per operation**    | Login, password reset, OTP, and writes need stricter limits than reads                                                   |
| **Limit by user too**                 | For authenticated APIs, `userId` is more accurate than IP (shared office Wi-Fi, mobile NAT)                              |
| **Account for IPv6**                  | One user can have many IPv6 addresses. Consider limiting by `/64` subnet                                                 |
| **Explicit outage policy**            | Choose fail-open or fail-closed per endpoint                                                                             |
| **Monitor Redis**                     | Memory, availability, errors. Plan for persistence, eviction, and high availability (Sentinel / Cluster / managed Redis) |
| **Test concurrent requests**          | Make sure parallel requests can't go over the limit                                                                      |
| **Return useful headers**             | `X-RateLimit-*` and `Retry-After` help well-behaved clients back off                                                     |
| **Consider a library**                | `express-rate-limit` + `rate-limit-redis`, or `rate-limiter-flexible`, are tested and support more algorithms            |
| **Don't rely on rate limiting alone** | Still use auth, validation, CAPTCHA, WAF/CDN limits, and monitoring                                                      |

---

### 15. Common interview questions

**Q1. Why use Redis instead of an in-memory JavaScript object?**
Redis is shared by all app instances, survives app restarts, has atomic `INCR`, and expires keys automatically.

**Q2. Why does `INCR` return 1 when the key doesn't exist?**
Redis treats a missing key as `0`, increments it, and returns `1`.

**Q3. Why use `EXPIRE`?**
It deletes the counter automatically when the window ends, so the client starts a new window without any cleanup code. It also keeps Redis memory from growing forever.

**Q4. Why set `EXPIRE` only when the count is 1?**
If you set it on every request, the TTL resets each time. A client who keeps sending requests would never get a new window (or a slow attacker's window would keep extending).

**Q5. Why is `INCR` followed by `EXPIRE` potentially problematic?**
They are two separate operations. If `INCR` succeeds but `EXPIRE` never runs (crash, network error), the key has no TTL and the client is blocked forever. A Lua script (or `MULTI`) makes them atomic.

**Q6. Why return HTTP 429?**
`429 Too Many Requests` is the standard status code for rate limiting. Clients and proxies understand it, and it can include `Retry-After`.

**Q7. Why use the IP address in the key? What are its problems?**
It gives each client its own counter without needing login. Problems: many users can share one IP (offices, mobile NAT), one user can have many IPs (IPv6, VPNs), and a wrong proxy config can make every request look like it comes from the same IP or let clients spoof it.

**Q8. What happens when the Node.js server restarts?**
Nothing changes. The counters live in Redis, not in the Node process.

**Q9. Can Redis rate limiting work across multiple Node.js servers?**
Yes. All servers use the same Redis and the same key format and limits, so they all update one shared counter.

**Q10. Rate limiting vs throttling?**
Rate limiting **rejects** requests over an allowance (429). Throttling usually **slows down or queues** requests instead of rejecting them. People often use the two words for the same thing.

**Q11. Fixed window vs sliding window?**
A fixed window resets the counter at fixed times, so bursts are possible at the edges (up to 2× the limit). A sliding window always looks at the last N seconds, which is smoother but costs more memory or computation.

**Q12. What happens if Redis goes down?**
It depends on the policy. Fail-closed rejects requests (safer). Fail-open lets them through (more available). Choose per endpoint.

**Q13. What happens if the same middleware is applied twice to a route?**
The counter goes up twice per request, so the real limit becomes about half of the configured limit.

---

### 16. Quick revision

| Term                   | Meaning                                                         |
| ---------------------- | --------------------------------------------------------------- |
| **Rate limiting**      | Max N requests per client per time window                       |
| **Redis**              | Shared in-memory store, one counter for all app instances       |
| **`INCR`**             | Atomically adds 1 (missing key → 1)                             |
| **`EXPIRE`**           | Sets a key's lifetime, which resets the window                  |
| **`TTL`**              | Seconds left before the key expires (`-1` no TTL, `-2` missing) |
| **`EVAL`**             | Runs a Lua script atomically (`INCR` + `EXPIRE` in one step)    |
| **Rate-limit key**     | `rateLimit:<policy>:<client>`, unique per client + policy       |
| **HTTP 429**           | Too Many Requests                                               |
| **`Retry-After`**      | Tells the client how long to wait                               |
| **Fixed window**       | Counts in fixed intervals; simple, but bursty at edges          |
| **Sliding window**     | Rolling interval; smoother, costs more                          |
| **Token bucket**       | Tokens refill over time; allows controlled bursts               |
| **Fail-open**          | Redis down → allow the request                                  |
| **Fail-closed**        | Redis down → reject / error the request                         |
| **`trust proxy`**      | Makes `req.ip` the real client behind a proxy                   |
| **Express middleware** | Enforces the limit **before** the controller runs               |


## Pub-Sub

- Pub/Sub stands for Publisher–Subscriber. It's a messaging pattern in which one part of your application sends a message, and other parts that are listening receive it.

### Working

- publisher sends a message to a named channel.
- a named redis channel (such as notifications) broadcasts the Message.
- Every subscriber currently listening to that channel receives the message.
  The publisher doesn't need to know who the subscribers are. It simply publishes a message, and Redis distributes it to the subscribers currently listening.

### Need of Redis Pub/Sub

- In a clinic management system, when a patient books an appointment, several things might need to happen:
  - The notification service informs the doctor.
  - The dashboard updates the appointment list.
  - An activity-monitoring service logs the event.
- Without Pub/Sub, booking API might need to call each service directly.
- With Pub/Sub, it can publish one event: "appointment:booked"
- Other services subscribe to that channel and react independently.
- This reduces direct dependencies between different parts of your application.

### Example

- create two separate files: one publishes messages, and the other subscribes to them.
- Both Subscriber and Publisher need their own client.

1. Subscribe

  ```ts
  import "dotenv/config";
  import { createClient } from "redis";

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const subscriberClient = createClient({ url: redisUrl });

  const channel = "demo:notifications";

  const run = async () => {
    subscriberClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    // Subscriber must be active before publisher publishes message
    await subscriberClient.connect();

    console.log("Subscriber connected & listening.");

    await subscriberClient.subscribe(channel, (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Title: ", data.title);
        console.log("Message: ", data.message);
      } catch {
        console.error("Received invalid JSON:", message);
      }
    });

    console.log("Listening for notifications...");

    // On Ctrl+C: unsubscribe from the channel, then close the connection
    process.on("SIGINT", async () => {
      await subscriberClient.unsubscribe(channel);
      await subscriberClient.close();
      console.log("Unsubscribed & disconnected.");
      process.exit(0);
    });
  };

  run().catch((error) => {
    console.error("Pub-Sub error: ", error);
  });
  ```

2. Publish

  ```ts
  import "dotenv/config";
  import { createClient } from "redis";

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const publisherClient = createClient({ url: redisUrl });

  const channel = "demo:notifications";

  const event = {
    title: "Redis Course",
    message: "Pub-Sub demo",
  };

  const run = async () => {
    publisherClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    await publisherClient.connect();

    console.log("Publisher connected to Redis.");

    // PUBLISH returns how many subscribers received the message
    const receivers = await publisherClient.publish(
      channel,
      JSON.stringify(event),
    );

    console.log(`Message delivered to ${receivers} subscriber(s).`);

    await publisherClient.close();
  };

  run().catch((error) => {
    console.error("Pub-Sub error: ", error);
  });
  ```

- Run these in separate terminals (start the subscriber first):
  ```bash
  npm run example:redis-sub   # terminal 1 -> tsx exmples/redis-sub.ts
  ```
  ```bash
  npm run example:redis-pub   # terminal 2 -> tsx exmples/redis-pub.ts
  ```
- Note: plain `node file.ts` does not run TypeScript on Node 22.13 (needs `--experimental-strip-types`), so use `tsx`.
- Note: the code is wrapped in an `async` function `run()` because top-level `await` works only in ES modules, and this project is CommonJS.

- The subscriber should print:
  ```text
  Subscriber connected & listening.
  Listening for notifications...
  Title:  Redis Course
  Message:  Pub-Sub demo
  ```
- The publisher should print:
  ```text
  Publisher connected to Redis.
  Message delivered to 1 subscriber(s).
  ```
- Press `Ctrl+C` in the subscriber terminal; it unsubscribes and prints `Unsubscribed & disconnected.`

### Important points

- **A subscriber needs its own connection.** Once a client subscribes, it enters subscriber mode and cannot run normal commands like `GET`/`SET`. In an app, create a separate client for it:
  ```ts
  const redisClient = createClient({ url: redisUrl }); // normal commands (GET/SET...)
  const subscriberClient = redisClient.duplicate();    // same config, separate connection

  await redisClient.connect();
  await subscriberClient.connect();
  ```
- **`PUBLISH` returns the number of subscribers that received the message.** `0` means nobody was listening, and the message is lost (it is not stored).
  ```ts
  const receivers = await publisherClient.publish(channel, JSON.stringify(event));
  console.log(`Message delivered to ${receivers} subscriber(s).`); // e.g. 1
  ```
- **At-most-once delivery.** No acknowledgement or retry: if a subscriber disconnects, it loses those messages permanently.
- **Pattern subscriptions.** `PSUBSCRIBE demo:*` subscribes to every matching channel (`demo:notifications`, `demo:alerts`, ...).
  ```ts
  await subscriberClient.pSubscribe("demo:*", (message, channel) => {
    console.log(`[${channel}]`, message);
  });
  ```

### Redis Pub-Sub vs Message Queue

| Feature            | Redis Pub/Sub                                 | Message Queue                                          |
| ------------------ | --------------------------------------------- | ------------------------------------------------------ |
| Main purpose       | Broadcast messages                            | Deliver work or messages                               |
| Multiple listeners | All active subscribers receive the message    | Depends on queue and consumer configuration            |
| Message storage    | No message history                            | Can retain pending messages                            |
| Offline consumer   | Misses messages                               | Messages can remain available, depending on the system |
| Best for           | Live updates, events, real-time notifications | Background jobs, reliable processing                   |

- For example, if your subscriber is offline when someone publishes payment:completed, Redis Pub/Sub does not save the event for that subscriber to receive later.
- For reliable background jobs, you might use BullMQ, which uses Redis, or Redis Streams when you need persisted events and consumer tracking.

### When should you use Pub/Sub in real projects?

- Real-time notifications: Publish an event when a user receives a notification, and let connected services react to it.
- Live dashboards: Broadcast changes so active dashboards can update their data.
- Communication between services: Let one service announce an event without needing to know which other services are listening.
- Live activity feeds: Broadcast events such as a user joining a room or a new item being added.

Redis Pub/Sub alone does not deliver updates directly to a user's browser. For browser notifications, your backend typically combines Pub/Sub with WebSockets or Server-Sent Events.

## Unsubscribe from a channel

- redis-cli:
  ```bash
  UNSUBSCRIBE demo:notifications
  PUNSUBSCRIBE demo:*   # for pattern subscriptions
  ```
- node-redis:
  ```ts
  await subscriberClient.unsubscribe("demo:notifications");
  await subscriberClient.pUnsubscribe("demo:*");
  ```
- Calling `unsubscribe()` with no arguments unsubscribes from all channels.
- Only the subscriber unsubscribes. The publisher never subscribed, so it just calls `close()` after publishing.
- In the example above, the subscriber unsubscribes on `Ctrl+C` (`SIGINT`) before closing the connection, so it shuts down cleanly.


## Pub-Sub practical implementation (Notification API)

- Goal: `POST /notifications` publishes a notification to Redis, and a separate subscriber process receives and logs it.
- Publisher = the Express API (uses the shared `redisClient`).
- Subscriber = a separate Node process with its **own** Redis client (`npm run subscriber`).

### Flow
```text
Client --POST /notifications--> Express API
                                   |
                     validate body -> build payload
                                   |
                  PUBLISH "notifications" <JSON>   (returns receivers count)
                                   |
                                 Redis
                                   |
              every active subscriber of "notifications"
                                   |
            notification.subscriber.ts -> JSON.parse -> validate shape -> log
```

### Folder structure
```text
src/
  types/notification.ts            <- NotificationPayload + isNotificationPayload()
  pubsub/
    channels.ts                    <- NOTIFICATION_CHANNEL
    notification.publisher.ts      <- publishNotification()
    notification.subscriber.ts     <- standalone subscriber process
  controllers/notification.controller.ts
  routes/notification.routes.ts
  routes/index.ts                  <- router.use("/notifications", notificationRoutes)
```
- Channel names and payload types live in their **own files**, so the publisher and the subscriber both import from them and never import each other.

### 1. Payload type + runtime validation (`src/types/notification.ts`)
```ts
export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

// JSON.parse() gives no type safety, so check the shape at runtime
export function isNotificationPayload(value: unknown): value is NotificationPayload {
  if (typeof value !== "object" || value === null) return false;

  const data = value as Record<string, unknown>;

  return (
    typeof data.id === "string" &&
    typeof data.title === "string" &&
    typeof data.message === "string" &&
    typeof data.createdAt === "string"
  );
}
```
- `JSON.parse(message) as NotificationPayload` only tells TypeScript what to expect; it checks nothing at runtime.
- Anyone can publish to a channel (e.g. `redis-cli PUBLISH notifications hello`), so the subscriber must validate what it receives.

### 2. Channel name (`src/pubsub/channels.ts`)
```ts
// Shared by publishers and subscribers.
// Keep channels here: importing a *.subscriber.ts file would start a subscriber.
export const NOTIFICATION_CHANNEL = "notifications"
```

### 3. Publisher (`src/pubsub/notification.publisher.ts`)
```ts
import { redisClient } from "../redis/client";
import { NotificationPayload } from "../types/notification";
import { NOTIFICATION_CHANNEL } from "./channels";

// Returns how many subscribers received the message (0 = nobody was listening, message is lost)
export const publishNotification = async(notification: NotificationPayload): Promise<number> => {
    return redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify(notification))
}
```
- The publisher reuses the app's normal `redisClient`. Publishing does not put a client into subscriber mode.
- Redis channels carry strings, so objects are sent with `JSON.stringify()`.

### 4. Controller (`src/controllers/notification.controller.ts`)
```ts
const MAX_TITLE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;

export const publishNotificationController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {title, message} = req.body;

        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Title is required and must be a non-empty string",
            });
        }

        if (title.trim().length > MAX_TITLE_LENGTH) { /* 400 */ }
        // same two checks for `message` (MAX_MESSAGE_LENGTH)

        const notification: NotificationPayload = {
            id: randomUUID(),               // from "crypto"; Date.now() can repeat
            title: title.trim(),
            message: message.trim(),
            createdAt: new Date().toISOString()
        }

        const receivers = await publishNotification(notification)

        // Pub/Sub does not store messages: with 0 receivers the notification is lost
        if (receivers === 0) {
            console.warn(`Notification ${notification.id} published, but no subscribers were listening.`)
        }

        res.status(201).json({
            success: true,
            message: 'Notification published successfully!',
            data: { id: notification.id, receivers }
        })
    } catch (error) {
        next(error);   // never leave catch empty: the request would hang forever
    }
}
```

### 5. Route
```ts
// src/routes/notification.routes.ts
router.post('/', notificationController.publishNotificationController)

// src/routes/index.ts
router.use("/notifications", notificationRoutes);
```

### 6. Subscriber process (`src/pubsub/notification.subscriber.ts`)
```ts
import "dotenv/config"; // must be first: this file runs as its own process (npm run subscriber)
import { createClient } from "redis"
import { isNotificationPayload } from "../types/notification";
import { NOTIFICATION_CHANNEL } from "./channels";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const subscriberClient = createClient({url: redisUrl})

subscriberClient.on('error', (err)=> {
    console.error('Notification subscriber error: ', err)
})

const startNotificationSubscriber = async() => {
    await subscriberClient.connect();

    await subscriberClient.subscribe(NOTIFICATION_CHANNEL, (message) => {
        try {
            const notification: unknown = JSON.parse(message)

            if (!isNotificationPayload(notification)) {
                console.error('Invalid notification payload: ', message)
                return
            }

            console.log(`Title: ${notification.title}, \nMessage: ${notification.message} \nCreated At: ${notification.createdAt}`)
        } catch (error) {
            console.error('Invalid JSON received: ', message)
        }
    })

    console.log(`Subscribed to "${NOTIFICATION_CHANNEL}" channel.`)
}

// Graceful shutdown: unsubscribe, then close the connection
const shutdown = async () => {
    if (subscriberClient.isOpen) {
        await subscriberClient.unsubscribe(NOTIFICATION_CHANNEL)
        await subscriberClient.close()
    }
    console.log('Notification subscriber stopped.')
    process.exit(0)
}

process.on('SIGINT', shutdown);  // Ctrl+C in terminal
process.on('SIGTERM', shutdown); // docker stop / hosting platforms

startNotificationSubscriber().catch(error => {
    console.error("Start notification subscriber error", error)
    process.exit(1)
})
```
- It runs on its own, not through `server.ts`, so it must load `.env` itself (`import "dotenv/config"`). Otherwise `REDIS_URL` is ignored.
- It uses its own client, because a subscribed connection cannot run normal commands like `GET` or `SET`.

### 7. Script (`package.json`)
```json
"subscriber": "tsx watch src/pubsub/notification.subscriber.ts"
```

### Run and test
- Terminal 1: `npm run dev` (API server)
- Terminal 2: `npm run subscriber` (start it before publishing, or messages are missed)
- Terminal 3:
  ```bash
  # valid -> 201
  curl -X POST http://localhost:5000/notifications \
    -H "Content-Type: application/json" \
    -d '{"title":"Hello","message":"Pub-Sub works"}'
  # {"success":true,"message":"Notification published successfully!","data":{"id":"<uuid>","receivers":1}}

  # invalid -> 400
  curl -X POST http://localhost:5000/notifications \
    -H "Content-Type: application/json" -d '{}'
  # {"success":false,"message":"Title is required and must be a non-empty string"}

  # bad messages straight to Redis -> subscriber logs an error and skips them
  redis-cli PUBLISH notifications 'not json'
  redis-cli PUBLISH notifications '{"title":"x"}'

  # how many subscribers are listening right now
  redis-cli PUBSUB NUMSUB notifications
  ```
- Subscriber terminal output:
  ```text
  Subscribed to "notifications" channel.
  Title: Hello,
  Message: Pub-Sub works
  Created At: 2026-10-18T08:49:30.000Z
  ```
- Stop the subscriber with `Ctrl+C`: it prints `Notification subscriber stopped.`
- Stop the subscriber, then publish again: the response shows `"receivers":0`, the server logs a warning, and the message is lost.

### Quick revision
- API = publisher (shared client). Subscriber = separate process with its own client.
- Keep channel names and payload types in shared files; publisher and subscriber must not import each other.
- Validate twice: the HTTP body before publishing, and the message shape after `JSON.parse` in the subscriber.
- `publish()` returns the number of receivers; `0` means the message is gone.
- Pub/Sub is fire-and-forget: use Redis Streams or BullMQ if notifications must not be lost.
