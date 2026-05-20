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

async function redisPipelineAndTransactions() {
    try {
        // Pipelining - Sending multiple commands to a redis server in batch → Performance optimization
        // Transaction - Allow multiple commands to be executed as a single unit → Atomic execution

        const transaction = client.multi()

        transaction.set("transaction-key1", "value1")
        transaction.set("transaction-key2", "value2")
        transaction.get("transaction-key1")
        transaction.get("transaction-key2")

        const transactionResult = await transaction.exec()
        console.log("transactionResult: ", transactionResult)

        const pipeline = client.multi()

        pipeline.set("pipeline-key1", "value1")
        pipeline.set("pipeline-key2", "value2")
        pipeline.get("pipeline-key1")
        pipeline.get("pipeline-key2")

        const pipelineResult = await pipeline.exec()
        console.log("pipelineResult: ", pipelineResult)

        // Transaction Example
        const dummyTransactionExample = client.multi()

        dummyTransactionExample.decrBy('account:1234:balance', 100)
        dummyTransactionExample.incrBy('account:4321:balance', 100)

        const dummyTransactionResult = await dummyTransactionExample.exec()
        console.log("dummyTransactionResult: ", dummyTransactionResult);

        // Pipeline Example
        const dummyPipelineOne = client.multi()

        for (let i; i < 1000; i++) {
            dummyPipelineOne.set(`user:${i}:action`, `Action${i}`)
        }

        const dummyPipelineOneResult = await dummyPipelineOne.exec()
        console.log("dummyPipelineOneResult: ", dummyPipelineOneResult)

        // Cart Example - Transaction
        const cartExample = client.multi()

        cartExample.hIncrBy('cart:1234', 'item-count', 1)
        cartExample.hIncrBy('cart:1234', 'total+price', 10)

        const cartResult = await cartExample.exec()
        console.log("cartResult", cartResult);

        // Performance Testing
        console.time("Without Pipelining")

        for (let i = 0; i < 1000; i++) {
            await client.set(`User_${i}`, `user_value_${i}`)
        }

        console.timeEnd("Without Pipelining")

        console.time("With Pipelining")

        const bigPipeline = client.multi()

        for (let i = 0; i < 1000; i++) {
            bigPipeline.set(`big_pipeline_key_${i}`, `user_pipeline_value_${i}`)
        }

        await bigPipeline.exec()

        console.timeEnd("With Pipelining")
    } catch (error) {
        console.error('Redis operation error:', error)
    }
}

module.exports = {
    testRedisOperations,
    testRedisFeatures,
    redisPipelineAndTransactions
}