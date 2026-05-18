const redis = require('redis')

const client = redis.createClient({
    host: "localhost",
    port: 6379
})

// Redis event listeners
client.on('connect', () => {
    console.log('Redis client connected')
})

client.on('ready', () => {
    console.log('Redis is ready to use')
})

client.on('error', (error) => {
    console.error('Redis error:', error)
})

client.on('end', () => {
    console.log('Redis connection closed')
})

async function connectRedis() {
    try {
        await client.connect()
    } catch (error) {
        console.error('Error connecting Redis:', error)
    }
}

module.exports = {
    client,
    connectRedis
}