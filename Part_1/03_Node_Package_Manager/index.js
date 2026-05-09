const lodash = require('lodash')

const names = ['omkesh', 'dipti', 'hrishikesh', 'nilam', 'ramesh', 'shobha']

const capitalize = lodash.map(names, lodash.capitalize);

console.log(capitalize);
