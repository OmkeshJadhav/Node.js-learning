import { Buffer } from "node:buffer";

/*  
    What: A Buffer is a fixed-size sequence of bytes used to store raw binary data in Node.js.
    
    Purpose: Buffers allow Node.js to efficiently store and manipulate raw binary data (bytes), which is how files, network packets, and many other resources are represented internally.
    
    Use:
        1) Reading files
        2) Working with streams
        3) Receiving http request/response bodies
        4) Handling images, pdf files, audios, videos
        5) Encryption and hashing
        5) TCP sockets

    Why use buffer and not strings: 
        - Whenever Node.js - reads a file, receives network data, or processes an image - it works with bytes first, not strings. Strings are good only for normal texts and not good for raw binary data.
        - e.g. Text file → 48 65 6c 6c 6f → Buffer → toString() → "Hello"
        String = Human readable texts
        Buffers = Raw binary data in bytes

    In many functions/modules Node.js automatically uses buffers.
        - fs.readFileSync
        - stream.on("data")
        - req.on("data")
        - crypto.randomBytes()
*/

// BUFFER METHODS

/* 1) buffer.from - To create buffer from a string, array, or ArrayBuffer. - Gives output in hexadecimal format (<Buffer 4e 6f 64 65>). Each hexadecimal pair represents one byte. */
const textBuffer = Buffer.from('Node')
console.log(textBuffer)

/* 2) toString - To convert buffer to string. With toString give text format */  
const text = textBuffer.toString('utf-8')
console.log(text)

/* 3) length - Returns the number of bytes (Not characters) stored in the Buffer. */
console.log("Buffer length: ", textBuffer.length)

const unicodeBuffer = Buffer.from("😊");
console.log("unicodeBuffer: ", unicodeBuffer)
console.log("Unicode buffer length: ", unicodeBuffer.length);  // 4

/* 4) alloc - Allocate fixed buffer size bytes and all allocated bytes are initialized to 0x00. With alloc method specify the size of the empty Buffer to be created. */
const fixedBuffer = Buffer.alloc(5);
console.log('Created Empty Fixed Buffer:', fixedBuffer)  // <Buffer 00 00 00 00 00>
    // Buffers are fixed-size. After alloc You cannot make it larger. Either you have to Allocate a new Buffer or Use Buffer.concat().

/* 5) write - To write or add a string to the buffer. If buffer did not contain enough space to fit the string then only part of the string will be added / written. */
fixedBuffer.write("API")
console.log("Fixed buffer after write: ", fixedBuffer)  // <Buffer 41 50 49 00 00>

const writeBuffer = Buffer.alloc(5);
writeBuffer.write("JavaScript");
console.log("Write Buffer: ", writeBuffer)  // <Buffer 4a 61 76 61 53> - Only the first five bytes fit.
console.log("Write Buffer string: ", writeBuffer.toString('utf-8'))  // JavaS

// When we convert the buffer to UTF-8 String, Node ignores the trailing empty/null bytes i.e. 00 00 will not be shown in the string
console.log("Fixed buffer as text: ", fixedBuffer.toString('utf-8'))  // API

/* 6) concat - To combine multiple buffers into a one single buffer */
const chunks = [
    Buffer.from("Hello "),
    Buffer.from("Node "),
    Buffer.from("JS ")
]

const combineBuffer = Buffer.concat(chunks)

console.log("Chunks combined into Buffer: ", combineBuffer)
console.log("Combined Buffer converted to String: ", combineBuffer.toString('utf-8'))