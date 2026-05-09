// Every async fucntion will return apromise
// Await keyword can only be used inside the async function. It can't be written anywhere else.
// Await pauses the execution of the function until the promise get resolved - await pauses only the current async function, The event loop continues executing other tasks


function division(num1, num2){
    return new Promise((resolve, reject) => {   // new Promise(...) creates and returns a promise
        if(num2 === 0){
            reject(new Error('Cannot divide by 0.'))  // resolve(value) - fulfills the promise passes value to .then()
        } else {
            resolve(num1/num2) // reject(reason): rejects the promise & passes reason to .catch()
        }
    })
}

async function run() {
    try {
        const result = await division(10, 2)
        console.log('Result:', result)
    } catch (err) {
        console.error(err.message)
    }
}

run()