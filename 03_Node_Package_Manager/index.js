const lodash = require('lodash')

const names = ['Omkesh', 'Dipti', 'Hrishikesh', 'Nilam', 'Ramesh', 'Shobha']

const capitalize = lodash.map(names, lodash.capitalize);

console.log(capitalize);
