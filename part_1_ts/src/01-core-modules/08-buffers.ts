import { Buffer } from "node:buffer";

/*
    Need: To work with raw binary data (data stored in bytes.)
    Use:
        1) Reading files
        2) Receiving http request bodies
        3) Working with streams
        4) Handling images, pdf files, videos
        5) Encrypt and hashing

    Why use buffer and not strings: Strings are good only for normal texts and not good for raw binary data.
        String = Human readable texts
        Buffers = Raw binary data in bytes
*/

// BUFFER METHODS

/* 1) buffer.from - To create normal buffer? - Gives output in hexadecimal format (<Buffer 4e 6f 64 65>). Hach value is 1 byte */
const textBuffer = Buffer.from('Node')
console.log(textBuffer)

/* 2) toString - To convert buffer to string. With toString give text format */  
const text = textBuffer.toString('utf-8')
console.log(text)

/* 3) length - Gives length of the buffer */
console.log("Buffer length: ", textBuffer.length)

/* 4) alloc - Allocate fixed buffer size bytes. With alloc method specify the size of the empty Buffer to be created. */
const fixedBuffer = Buffer.alloc(5);
console.log('Created Empty Fixed Buffer:', fixedBuffer)  // <Buffer 00 00 00 00 00>

/* 5) write - To write or add a string to the buffer. If buffer did not contain enough space to fit the string then only part of the string will be added / written. */
fixedBuffer.write("API")
console.log("Fixed buffer after write: ", fixedBuffer)  // <Buffer 41 50 49 00 00>

// When we convert the written buffer to String, empty bytes i.e. 00 00 will not be shown in the string
console.log("Fixed buffer as text: ", fixedBuffer.toString('utf-8'))  // API

/* 6) concat - To combine multiple chunks in one buffer */
const chunks = [
    Buffer.from("Hello "),
    Buffer.from("Node "),
    Buffer.from("JS ")
]

const combineBuffer = Buffer.concat(chunks)

console.log("Chunks combined into Buffer: ", combineBuffer)
console.log("Combined Buffer converted to String: ", combineBuffer.toString('utf-8'))