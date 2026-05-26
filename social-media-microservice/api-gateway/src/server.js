require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis')
const proxy = require('express-http-proxy');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

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
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info('Request Body: ', req.body);
    next();
})

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        const updatedPath = req.originalUrl.replace(/^\/v1/, "/api");
        return updatedPath;
    },
    proxyErrorHandler: ((err, res, next) => {
        logger.error(`Proxy error: ${err.message}`)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message
        })
        // next(err);
    })
}

// Setting up proxy for identity service
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json'
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response received from identity service: ${proxyRes.statusCode}`)
        return proxyResData;
    }
}
))

app.use(errorHandler)

const startServer = async () => {
    try {
        // listen to the server
        app.listen(PORT, () => {
            logger.info(`API gateway is running on PORT ${PORT}`);
            logger.info(`Identity service is running on ${process.env.IDENTITY_SERVICE_URL}`);
            logger.info(`Redis Url is running on ${process.env.REDIS_URL}`);
        });
    } catch (error) {
        logger.error("Server start failed -> ", error);
    }
}

startServer()
