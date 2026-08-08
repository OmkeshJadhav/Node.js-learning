/*
    What: Streams allow data to be processed piece by piece (chunks) instead of loading the entire data into memory at once. This makes streams ideal for handling large amounts of data efficiently.

    why streams exist
        - Without streams: 5 GB file ➔ Read entire file ➔ Memory (5 GB) ➔ Process ➔ Write
        - With streams: 5 GB file ➞ 64 KB ➞ Process ➞ Write ➞ Next 64 KB ➞ Process ➞ Write
            So, with streams Only one chunk is in memory at a time making them memory efficient.

    Use:
        1) To read, upload, download files,
        2) To process audio, video
        3) Compression

    Advantages:
        1) Memory efficient
        2) Streams automatically handle backpressure - If the destination is slower than the source,Node pauses the source until the destination catches up.

    Stream Types:
        1) Readable stream: Read the data from source
            - e.g. Read data from file, http request body
        2) Transform stream: Receives a chunk, modifies it, and forwards the modified chunk to the next stream.
            - e.g. Compression, Convert to upper case
        3) Writable stream: Write data to a destination
            - e.g. Write data to a file, send data to http server, upload data to cloud
        4) Duplex Stream: both read and write.
            - e.g. TCP sockets, WebSocket connections

    Stream gives data in chunks. chunk can be Buffer, string, Object (Object Mode)

    Pipeline: To connect all streams together.
        Use pipeline (rather than chaining .pipe) because: 
            1) automatically forwards errors
            2) cleans up streams
            3) returns a Promise (from node:stream/promises)

    Use of callback in writable and transform stream: 
        - Callback indicates chunk processing is succeessful. Send this new chunk to the next stream.
        - The stream won't continue until you call it.
*/

import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

// Readable
const readableStream = Readable.from([
    "hello ",
    "from ",
    "Node.js ",
    "streams."
])

// Transform
const uppercaseTransformStream = new Transform({
    transform(chunk, encoding, callback) {
        const text = chunk.toString();
        callback(null, text.toUpperCase());
    },
})

// Writable
const writableStream = new Writable({
    write(chunk, encoding, callback) {
        console.log('Received chunk', chunk.toString())
        callback()
    },
})

// Pipeline to connect all streams together
const main = async ():Promise<void> => {
    try {
        await pipeline(readableStream, uppercaseTransformStream, writableStream)
        console.log("Stream completed");

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Error'
        console.error("stream failed", errorMessage);
    }
}

main()

/* 
    Received chunk: HELLO
    Received chunk: FROM
    Received chunk: NODE.JS
    Received chunk: STREAMS.
    Stream completed
*/