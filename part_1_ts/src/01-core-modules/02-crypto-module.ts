import crypto from 'node:crypto'

// randonUUID
const requestId = crypto.randomUUID();
console.log("requestId: ", requestId)

// randomBytes
const resetToken = crypto.randomBytes(16).toString('hex');
console.log("resetToken: ", resetToken)

// createHash
const text = 'hello node'
const hash = crypto.createHash('sha256').update(text).digest('hex')
console.log("hash: ", hash)

// createHmac
const secret = 'my-secret-key'
const message = 'user_id=1'
const signature = crypto.createHmac('sha256', secret).update(message).digest('hex')
console.log("signature: ", signature)
