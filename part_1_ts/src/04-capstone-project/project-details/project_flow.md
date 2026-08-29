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
        - "5444:5435"

        environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: nodejs-capstone

        volumes:
        - postgres_data:/var/lib/postgresql/data

    volumes:
    postgres_data:

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
    - 001_enable_pgcryto.sql
    - 002_create_user_table.sql: id, email, password_hash, google_id, role, created_at, updated_at
    - 003_create_support_tasks_table.sql: id, title, status, user_id
    - 004_create_banners_table.sql: id, image_url, cloudinary_public_id, created_at, updated_at

### Create PostgreSQL connection pool 
- Install pg package and its types
    ```
    npm install pg
    npm i --save-dev @types/pg
    ```
    - pg is a postgres client for Node.js. It acts as medium that allows Node.js app to connect, query and interact with postgres DB. 
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
- Create migrate.ts in scripts folder or db folder: /src/scripts/migrate.ts or /src/db/migrate.ts
