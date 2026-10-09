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


2. Admin Middleware


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
        validateTaskId(taskId)
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

#### 2. Create getUserTaskById in src/services/user.task.service.ts (Business logic)
- Create validateTaskId helper function
    - Why? id column of support_tasks is UUID type. If client sends something like "abc" in the URL, Postgres throws error `invalid input syntax for type uuid` → errorHandler treats it as unknown error → 500 Internal Server Error. But it is the client's mistake, so it should be 400 (Bad Request).
    - So we check taskId format using a UUID regex before hitting the DB - if it doesn't match, throw AppError 400
    - UUID format: 8-4-4-4-12 hex characters, e.g. `3f2a1b4c-9d8e-4f7a-b6c5-1a2b3c4d5e6f`. `i` flag -> case-insensitive (A-F or a-f both allowed)
    ```
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    const validateTaskId = (taskId: string): void => {
        if(!UUID_REGEX.test(taskId)){
            throw new AppError(400, 'Invalid task id.')
        }
    }
    ```
- Create getUserTaskById function
    - Validate taskId using validateTaskId - else 400
    - Call fetchTaskByTaskId from repository
    - If task is null (not found or belongs to another user) - throw AppError 404 (Not Found)
    - Return the task
    ```
    import { createTask, fetchTaskByTaskId, fetchTasksByUserId } from "../repositories/user.task.repository";

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

#### 3. Create get by id route in src/routes/user.task.routes.ts
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
        validateTaskId(taskId)
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
        validateTaskId(taskId)
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

### 1. Move TASK_STATUSES to src/types/task.ts (shared by user & admin service)
- Earlier TASK_STATUSES was inside user.task.service.ts. Now admin.task.service.ts also needs it, so we move it to types/task.ts - one place for the list, both services import it.
    ```
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

### 5. Create admin task route in src/routes/admin.task.routes.ts
- `adminTaskRouter.use(authenticate, requireAdmin)` -> applies BOTH middlewares to all routes of this router, in this order:
    1. authenticate -> verifies the token and sets req.user (401 if not logged in)
    2. requireAdmin -> checks `req.user.role === 'ADMIN'` (403 if not admin)
    - Order matters - requireAdmin needs req.user, which is set only by authenticate
    - 401 vs 403: 401 = "who are you? (not logged in)", 403 = "I know who you are, but you are not allowed"
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

#### 5.1 Why check the type of req.query values? (lines 16-19)
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

### 6. Provide the admin task route to root route in src/routes/index.ts
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