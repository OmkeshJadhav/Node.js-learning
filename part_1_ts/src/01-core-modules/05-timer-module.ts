import {setTimeout as sleep} from 'node:timers/promises'

// setTimeout: Run the code after some delay of specified time
function runSetTimeoutExample(): void {
    console.log('1. Timeout process started')

    setTimeout(() => {
        console.log('2. This will run after 1 second.')
    }, 1000)

    console.log('3. Timeout process ended - But it will not wait for timeout to end and will run immediately.')
}

// clearTimeout: Clears the timeout
function runClearTimeoutExample(): void {
    console.log('4. run clearTimeout function started')
    const timerId = setTimeout(() => {
        console.log('5. This message will not run.')   // ---> This message will not run as timer is getting cleared even before it starts.
    }, 2000)

    clearTimeout(timerId)

    console.log('6. clearTimeout cancelled the timeout for timerId.')
}


// setInterval: Runs the callback repeatedly after the specified interval
const runSetIntervalExample = (): void => {
    console.log('7. setInterval example started.')
    
    let count = 0
    
    const intervalId = setInterval(() => {
        count++
        console.log(`8. setInterval tick: ${count}`)

        if (count === 5) {
            clearInterval(intervalId)
            console.log('9. interval cleared')
        }
    }, 1000)
}

// setImmediate - Runs callback immediately after the current sync code has finished.
const runSetImmediateExample = ():void => {
    console.log('10. setImmediate function started')

    setImmediate(() => {
        console.log('11. This will run immediately after synchronous code has finished.')
    })
}

// Promise based timers - Useful when you don't want to use setTimout. Position will depend on the duration of the sleep
const runPromiseTimerExample = async():Promise<void> => {
    console.log(`12. Waiting for promise based timer.`)

    await sleep(5500)

    console.log(`13. Promise based timer finishes after 5.5 seconds.`)
}

function runTimerDemo(): void {
    runSetTimeoutExample()
    runClearTimeoutExample()
    runSetIntervalExample()
    runSetImmediateExample()
}


runTimerDemo()
runPromiseTimerExample()