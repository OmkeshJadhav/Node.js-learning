function division(num1, num2) {
    return new Promise((resolve, reject) => {   // new Promise(...) creates and returns a promise
        if (num2 === 0) {
            reject(new Error('Cannot divide by 0.'))  // reject(reason): rejects the promise & passes reason to .catch()
        } else {
            resolve(num1 / num2) // resolve(value) - fulfills the promise passes value to .then()
        }
    })
}

division(10, 0)
    .then((result) => console.log('Result: ', result))
    .catch((err) => console.log(err))