import process from "node:process";

process.env.MY_SECRET

process.argv[0]
process.argv[1]
process.argv[2]

const shouldFail = process.argv.includes('--fail')
const shouldCrash = process.argv.includes('--crash')

process.on('exit', code => {
    console.log(`Process finished with exit code ${code}`)
})

function runApp(): void {
    // console.log({command})

    if(shouldFail){
        console.error('Manual failure triggered with --fail flag.')
        process.exit(1)
    }

    if(shouldCrash){
        console.error('Manual crash triggered with --crash flag')
        process.exit(1)
    }
}

runApp()