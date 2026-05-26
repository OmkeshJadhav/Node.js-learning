require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis')
const { RateLimiterRedis } = require('rate-limiter-flexible');

const app = express()

const PORT = process.env.PORT || 3000

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet())
app.use(cors())
app.use(express.json())

// Rate Limiting
const rateLimitP = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
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

app.use(rateLimitP)

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info('Request Body: ', req.body)
    next()
})
