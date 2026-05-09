const fs = require('fs/promises')
const path = require('path')

async function processFile() {
    const inputFile = path.join(__dirname, 'input.txt')
    const outputFile = path.join(__dirname, 'output.txt')

    try {
        const fileContent = await fs.readFile(inputFile, 'utf8')
        const modifiedFileContent = fileContent.toUpperCase()

        await fs.writeFile(outputFile, modifiedFileContent)

        const result = await fs.readFile(outputFile, 'utf8')
        console.log('Final File Content:', result)
    } catch (err) {
        console.error('Error:', err.message)
    }
}

processFile()
