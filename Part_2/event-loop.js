const fs = require("fs")
const crypto = require("crypto")

console.log('1. Script start')

setTimeout(() => {
    console.log('2. setTimeout 0s timeout (macrotask)')
}, 0)

setTimeout(() => {
    console.log('3. setTimeout 0s timeout (macrotask)');
}, 500)

setImmediate(() => {
    console.log('4. setImmediate callback (check)');
})

Promise.resolve().then(() => {
    console.log("4. Promise Resolved (microtask)")
})

process.nextTick(() => {
    console.log('6. process.nextTick callback (microtask)');
})

fs.readFile(__filename, () => {
    console.log('7. File read operation (I/O callback)');
})

crypto.pbkdf2("secret", "salt", 1000, 64, "sha512", (err, key) => {
    if (err) throw err;
    console.log("8. pbkdf2 operation completed (CPU intensive task)");
})

console.log('9. Script ends.')