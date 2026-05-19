const { client } = require('../../config/redis-config')

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

module.exports = {
    testRedisOperations
}