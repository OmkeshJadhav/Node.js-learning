console.log('Node module wrapper demo.');

console.log('Filename in wrapper explorer', __filename);
console.log('Dirname in wrapper explorer', __dirname);

module.exports.greet = function (name) {
    console.log(`Hello ${name}`);
}

