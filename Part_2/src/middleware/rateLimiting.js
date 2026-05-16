const rateLimit = require('express-rate-limit')

const basicRateLimiter = (maxRequests, time) => {
    return rateLimit({
        windowMs: time,
        limit: maxRequests,
        message: 'Too many requests, please try again!',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false,
    })
}

module.exports = { basicRateLimiter }