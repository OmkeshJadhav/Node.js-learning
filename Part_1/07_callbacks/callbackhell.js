// Callback hell - Callback inside another callback

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'index.txt')
const outputFilePath = path.join(__dirname, 'output.txt')

fs.readFile(filePath, 'utf8', (err, data) => {
    if(err){
        console.log('An error occurred.');
        return;
    }

    console.log('File Content: ', data);
    
    const modifyFileData = data.toUpperCase()

    fs.writeFile(outputFilePath, modifyFileData, (err) => {
        if(err){
            console.log('Error Occurred while writing file: ', err);
            return;
        }

        fs.readFile(outputFilePath, 'utf8', (err, data) => {
            if(err){
                console.log('Error occurred while reading output file: ', err.message);
                return;
            }

            console.log(data);
            
        })
        
    })
})