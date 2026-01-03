// Example 2
const fs = require('fs/promises')
const path = require('path')

const inputFile = path.join(__dirname, 'input.txt')
const outputFile = path.join(__dirname, 'output.txt')

fs.readFile(inputFile, 'utf8')
    .then((data) => {
        const modifiedData = data.toUpperCase()
        return fs.writeFile(outputFile, modifiedData)
    })
    .then(() => {
        console.log('File written successfully!')
        return fs.readFile(outputFile, 'utf8')
    })
    .then((result) => {
        console.log('Final File Content:', result)
    })
    .catch((err) => {
        console.error('Error:', err.message)
    })
