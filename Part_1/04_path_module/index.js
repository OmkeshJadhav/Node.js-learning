// Provides utilities to work with file and directory path

const path = require('path')

console.log('Directory Name: ', path.dirname(__dirname));
console.log('File Name: ', path.basename(__filename));
console.log('Extension Name: ', path.extname(__filename));

const joinPath = path.join('1', '2', '3', '4')
console.log("Joined Path: ", joinPath);

const joinPath2 = path.join(__dirname, 'uploads', 'image.png')
console.log("Joined Path2: ", joinPath2);

const resolvePath = path.resolve('1', '2', '3', '4')
console.log("Resolved Path", resolvePath);

const normalizePath = path.normalize('1/./2/../3//4')
console.log('Normalized Path', normalizePath);

const filePath = '/src/utils/helper.js';
console.log(path.parse(filePath));

const formatPath = path.format({
    dir: '/src/utils',
    name: 'helper',
    ext: '.js'
});
console.log(formatPath);
