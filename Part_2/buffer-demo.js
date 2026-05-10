// Objects that help to handle binary data
/**
 * Fixed length - Size cannot change
 * More efficient in representing binary data than normal strings
 * 
 * Use cases:
 * 1. File system operations
 * 2. Cryptography
 * 3. Image processing
 */

const buffOne = Buffer.alloc(10);   // Allocate a buffer of 10 bytes
console.log(buffOne);  // <Buffer 00 00 00 00 00 00 00 00 00 00>

const buffFromString = Buffer.from("Hello")
console.log(buffFromString);  // <Buffer 48 65 6c 6c 6f>
console.log(buffFromString[0]);  // 72
console.log(buffFromString.slice(0, 3));  // <Buffer 48 65 6c>

const buffFromArrayOfIntegers = Buffer.from([1, 2, 3, 4, 5])
console.log(buffFromArrayOfIntegers);  // <Buffer 01 02 03 04 05>

buffOne.write('Omkesh')
console.log('After writing string to buffer -> ', buffOne);  // <Buffer 4f 6d 6b 65 73 68 00 00 00 00>
console.log('After writing string to buffer -> ', buffOne.toString());  // Omkesh
console.log('After writing string to buffer -> ', buffOne[0]);  // 79

const concatBuffers = Buffer.concat([buffOne, buffFromString])
console.log(concatBuffers);  // <Buffer 4f 6d 6b 65 73 68 00 00 00 00 48 65 6c 6c 6f>
console.log(concatBuffers.toString());  // OmkeshHello
console.log(concatBuffers.toJSON());  // 
