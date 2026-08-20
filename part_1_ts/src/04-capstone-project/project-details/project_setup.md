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
    - Create env.ts file in config folder
    - In env.ts
        