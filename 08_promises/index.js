function division(num1, num2){
    return new Promise((resolve, reject) => {
        if(num2 === 0){
            reject('Cannot divide by 0.')  // Returns a promise
        } else {
            resolve(num1/num2) // Returns a promise
        }
    })
}

division(10, 0)
    .then((result) => console.log('Result: ', result))
    .catch((err) => console.log(err))