const firstModule = require('./first-module')

console.log(firstModule.add(10, 20));

console.log(firstModule.substract(10, 20));

try {
    console.log('Trying division by 0');
    console.log(firstModule.divide(10, 0));
} catch (error) {
    console.log(error.message);
}