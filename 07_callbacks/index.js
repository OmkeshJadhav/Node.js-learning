// Callbacks are fucntions that are passed as arguments to other functions. 
// It helps to defer the execution of the code untill the async operation has completed.

// Callback hell - Callback inside another callback

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'index.txt')

fs.readFile(filePath, 'utf8', (err, data) => {
    if(err){
        console.error('An error occurred')
        return;
    }

    console.log('File Content', data)
})