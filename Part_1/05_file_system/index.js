const fs = require('fs')
const path = require('path')

// Synchronous
// Creating a new folder at specified path
const dataFolder = path.join(__dirname, 'data');

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder)
    console.log('New Folder created');
}


// Create + write a new file
console.log(dataFolder);   // /Users/omkesh/MyCodingJourney/11.Nodejs/sangam_youtube/05_file_system/data
const filePath = path.join(dataFolder, 'example.txt')
// Sync way of creating the file
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'Hello')
    console.log('New File created');
}


// Read File content
const readFileContent = fs.readFileSync(filePath, 'utf8')
console.log('File Content: ', readFileContent);


// Add content
fs.appendFileSync(filePath, '\nThis is a new line. \nThis line is added by appending')


// Asynchronous
// Async way of creating the file
const asyncFilePath = path.join(dataFolder, 'async-file.txt')

fs.writeFile(asyncFilePath, 'Hello Async file', (err) => {
    if (err) throw err
    console.log('New Async File created');

    fs.readFile(asyncFilePath, 'utf8', (err, data) => {
        if (err) throw err
        console.log('Async file content: ', data);
    })

    fs.appendFile(asyncFilePath, '\nThis is new line added by async method.', (err) => {
        if (err) throw err
        console.log('New line added');
    })

    fs.readFile(asyncFilePath, 'utf8', (err, updatedData) => {
        if (err) throw err
        console.log('Async file updated content: ', updatedData);
    })
})