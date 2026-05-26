require('dotenv').config();
const express = require('express');
const connectToDB = require('./database/db');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const {RedisStore} = require('rate-limit-redis')
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const routes = require('./routes/identity-service')
const errorHandler = require('./middlewares/errorHandler')
const logger = require('./utils/logger')


const app = express()
const PORT = process.env.PORT || 3000

const redisClient = new Redis(process.env.REDIS_URL)

// middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info('Request Body: ', req.body)
    next()
})

// DDOS Protection and Rate Limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
})

app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limiter exceeded for IP ${req.ip}`);
            res.status(429).json({
                success: false,
                message: 'Too many requests.'
            })
        })
})

const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests.'
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

// Apply sensitiveEndpointsLimiter to route
app.use('/api/auth/register', sensitiveEndpointsLimiter)

// routes
app.use('/api/auth', routes)

// Error Handler
app.use(errorHandler)

const startServer = async () => {
    try {
        // connect to database 
        await connectToDB()

        // listen to the server
        app.listen(PORT, () => {
            logger.info(`Identity Service is running on PORT ${PORT}`);
        });
    } catch (error) {
        logger.error("Server start failed -> ", error);
    }
}

startServer()

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, "reason: ", reason)
})