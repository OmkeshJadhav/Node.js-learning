## Setup
+ npm init -y
+ node_modules
+ package.json & package-lock.json
+ tsconfig.json  


## Folder Structure 
- Create src folder
- Create server.ts as entry file inside src
- Create .env at the root level
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
- app.ts is entry point for express and express related logic
- Express will help us to create web server
- Create creatApp function and inside it use app.use middleware with express.json()
    - app.use(express.json()) return middleware that only parses json and only looks at request where Content-Type header matches the type option
```
import express from 'express'

export const creatApp = () => {
    const app = express();

    app.use(express.json());
}
```

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
- Middleware to parse incoming HTML form submission
- Parsesincoming requests with URL-encoded payloads.
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
- Import cors-config.ts in app.ts and then use as middleware
```
app.use(configureCors())
```

