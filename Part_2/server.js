require('dotenv').config()
const express = require('express')
// const cors = require('cors')
const { configureCors } = require('./src/config/cors-config')
const { addTimeStamp, requestLogger } = require('./src/middleware/customMiddleware')
const globalErrorHandler = require('./src/middleware/globalErrorHandler')
const { contentTypeVersioning, headerVersioning, urlVersioning } = require('./src/middleware/apiVersioning')
const { basicRateLimiter } = require('./src/middleware/rateLimiting')
const itemRoutes = require('./src/routes/item-routes')
const redis = require('redis')

const app = express();
const PORT = process.env.PORT || 3000

// Middlewares
app.use(addTimeStamp)
app.use(requestLogger)
// app.use(cors())
app.use(configureCors())
app.use(basicRateLimiter(100, 15*60*1000))
app.use(express.json())

// API versioning
app.use('/api', urlVersioning('v1'))

// Redis connection
const client = redis.createClient({
    host: "localhost",
    port: 6379
})

// redis event listener
client.on("error", (error) => {
    console.log("Redis client error occurred", error);
})

async function testRedisConnection(){
    try {
        await client.connect()
        console.log("Connected to Redis");
    } catch (error) {
        console.error("Error connecting Redis", error);
        
    } finally {
        await client.quit()
    }
} 

testRedisConnection()

// Routes
app.use('/api/v1/items', itemRoutes)

// Global Error Handler (ALWAYS LAST)
app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})