const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',  // Settimg logging level based on environment
    format: winston.format.combine(  // Combining all in a format messages
        winston.format.timestamp(),  // Timestamp for logs
        winston.format.errors({ stack: true }),  // Including stack trace in log entry if there is any error
        winston.format.splat(),  // enable support for message templating
        winston.format.json()  // Format log messages in json
    ),
    defaultMeta: { service: 'identity-service' },  // Service to be used for this particular logger
    transports: [   // output destination for logs
        new winston.transports.Console({  // Get logs in console
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),  // Write all logs with importance level of `error` or higher to `error.log`
        new winston.transports.File({ filename: 'combined.log' }),  // Write all logs with importance level of `info` or higher to `combined.log`
    ]
})

// levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// }

module.exports = logger;