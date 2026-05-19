require('dotenv').config()
const express = require('express')

// Config
const { configureCors } = require('./src/config/cors-config')
const { connectRedis, client } = require('./src/config/redis-config')

// Middlewares
const { addTimeStamp, requestLogger } = require('./src/middleware/customMiddleware')

const globalErrorHandler = require('./src/middleware/globalErrorHandler')

const { contentTypeVersioning, headerVersioning, urlVersioning } = require('./src/middleware/apiVersioning')

const { basicRateLimiter } = require('./src/middleware/rateLimiting')

const itemRoutes = require('./src/routes/item-routes')

// Redis service
const { testRedisOperations, testRedisFeatures } = require('./src/services/redis-service')


const app = express();
const PORT = process.env.PORT || 3000

// Middlewares
app.use(addTimeStamp)
app.use(requestLogger)
// app.use(cors())
app.use(configureCors())
app.use(basicRateLimiter(100, 15 * 60 * 1000))
app.use(express.json())

// API versioning
app.use('/api', urlVersioning('v1'))

// Routes
app.use('/api/v1/items', itemRoutes)

// Global Error Handler (ALWAYS LAST)
app.use(globalErrorHandler)

// Start Server
async function startServer() {
    try {
        // Connect Redis
        await connectRedis()

        // Test Redis
        await testRedisOperations()

        // Test Redis Features
        testRedisFeatures()

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`)
        })
    } catch (error) {
        console.error('Server startup error:', error)
    }
}

startServer()

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.quit()
    console.log('Redis disconnected')

    process.exit(0)
})