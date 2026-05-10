// Objects that let you read data from a source or write data to a destination.

/**
 * Types:
 * 1. readable -> Use for read
 * 2. writable -> Use for write to a file
 * 3. duplex -> Can be used for both read and write (TCP socket)
 * 4. transform -> zlib streams
 */

const fs = require("fs")
const zlib = require("zlib") // Provided by node.js for compression gzip
const crypto = require("crypto")
const { Transform } = require("stream");

class EncryptStream extends Transform {
    constructor(key, vector) {
        super();
        
        this.key = key;
        this.vector = vector;
    }

    _transform(chunk, encoding, callback) {
        const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.vector);
        const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]); // encrypt
        this.push(encrypted);
        callback();
    }
}

const key = crypto.randomBytes(32)
const vector = crypto.randomBytes(16)

const readableStream = fs.createReadStream('input.txt')

//new gzip object to compress the stream of data
const gzipStream = zlib.createGzip()

const encryptStream = new EncryptStream(key, vector)

const writableStream = fs.createWriteStream('output.txt.gz.enc')

// read -> compress -> encrypt -> write
readableStream.pipe(gzipStream).pipe(encryptStream).pipe(writableStream);

console.log('streaming -> compressing -> writing data');