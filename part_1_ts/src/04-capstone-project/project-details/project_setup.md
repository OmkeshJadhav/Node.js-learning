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
