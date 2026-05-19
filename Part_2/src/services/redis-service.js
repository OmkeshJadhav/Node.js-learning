const { client } = require('../config/redis-config')

async function testRedisOperations() {
    try {
        // SET
        await client.set('key', 'Omkesh')

        // GET
        const extractValue = await client.get('key')
        console.log('GET:', extractValue)

        // EXISTS - useful for cache checking
        const exists = await client.exists('key')
        console.log('EXISTS:', exists)

        // DELETE
        const deleteCount = await client.del('key')
        console.log('DELETE COUNT:', deleteCount)

        // Number operations
        await client.set('num', 100)

        // INCR
        const incrementValue = await client.incr('num')
        console.log('INCR:', incrementValue)

        // INCRBY
        const incrementByValue = await client.incrBy('num', 9)
        console.log('INCRBY:', incrementByValue)

        // DECR
        const decrementValue = await client.decr('num')
        console.log('DECR:', decrementValue)

        // DECRBY
        const decrementByValue = await client.decrBy('num', 5)
        console.log('DECRBY:', decrementByValue)

        // Key Expiry - Useful for OTPs, Sessions, Cache, Rate limiting, Temporary tokens
        await client.set('token', 'abc123', {
            EX: 60
        })

        console.log('Token stored with expiry')

        // TTL - Time To Live -> How many seconds are left before the key expires
        const ttl = await client.ttl('token')
        console.log('TTL:', ttl)  // -1 : Key exists forever, -2: Key does not exist.
        
        // setInterval(async () => {
        //     const ttl = await client.ttl('token')
        //     console.log('Remaining TTL:', ttl)
        // }, 1000)
        

    } catch (error) {
        console.error('Redis operation error:', error)
    }
}

// Pub-Sub: Pub/Sub (Publish/Subscribe) is a messaging pattern where: 
//     publishers send messages 
//     Messages are sent to channels 
//     subscribers listen to those channels and receive messages in real time.

// * Significance:
//      Publishers and subscribers do not communicate directly with each other. Redis acts as the message broker.

// * Commonly used in: 
//         1) Microservices 
//         2) Real-time notifications 
//         3) Chat applications 
//         4) Live updates 
//         5)Event-driven systems

// * Limitation: 
//     Redis Pub/Sub messages are NOT persisted i.e. If no subscriber is listening at that moment then message is lost forever

// * Difference Between Pub/Sub and Queue
// In Pub/Sub: 1) Messages are not saved 2) Subscribers must already be connected
// In queues (BullMQ/RabbitMQ/Kafka): 1) Messages persist 2) Consumers can process later

// * Publisher/Subscriber Analogy
// Publisher  → YouTuber uploads video
// Channel    → YouTube channel
// Subscriber → Users subscribed to channel
// Users automatically receive updates when new content is published.

async function testRedisFeatures() {
    try {
        // await client.connect()

        //* create a new client instance to subscribe to the messages
        const subscriber = client.duplicate()  // Create a separate Redis connection (new Redis client) for subscriber using same configuration
        await subscriber.connect()  // Connect subscriber to the redis server

        // Subscribe to a channel
        await subscriber.subscribe('dummy-channel', (message, channel) => {
            console.log(`Received message from ${channel} - ${message}`)
        })

        // Publish message to a dummy channel
        await client.publish('dummy-channel', 'Some dummy data from publisher')
        await client.publish('dummy-channel', 'A new message from publisher')

        // Create wait time using setTimeout - Wait before unsubscribing so messages can be received
        await new Promise((resolve) => setTimeout(resolve, 10000))

        // Unsubscribe from the channel
        await subscriber.unsubscribe('dummy-channel')

        // Close the subscriber connection
        await subscriber.quit()
    } catch (error) {
        console.error('Redis operation error:', error)
    }
}

module.exports = {
    testRedisOperations,
    testRedisFeatures
}