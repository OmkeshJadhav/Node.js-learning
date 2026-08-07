import path from 'node:path'
import process from 'node:process'
import fs, { write } from 'node:fs'

// fs: create/delete folder, create/write/read/delete files, check file information
// 3 Ways to work with fs: 1) sync APIs 2) Callback APIs 3) Promise APIs


// 1) sync
const DEMO_FOLDER_PATH = path.join(process.cwd(), 'file-system', 'fs-demo')
const SYNC_FILE_PATH = path.join(DEMO_FOLDER_PATH, 'sync-note.txt')
const CALLBACK_FILE_PATH = path.join(DEMO_FOLDER_PATH, 'callback-note.txt')
const PROMISE_FILE_PATH = path.join(DEMO_FOLDER_PATH, 'promise-note.txt')

type FileInfo = {
    style: string,
    fileName: string,
    content: string,
    sizeInBytes: number
}

// check of folder exists - If no then create it
const ensureDemoFolderExists = (): void => {
    if (!fs.existsSync(DEMO_FOLDER_PATH)) {
        fs.mkdirSync(DEMO_FOLDER_PATH, { recursive: true })
    }
}

const runSyncExample = (): FileInfo => {
    //write content to the file - writeFileSync(file, content, file-option) - If file is doesn't exist then node will create it. But if already exists then node will replace the content.
    fs.writeFileSync(SYNC_FILE_PATH, 'This content was created using Sync file system', 'utf-8')

    // Append the content to existing content - appendFileSync(file, content, file-option)
    fs.appendFileSync(
        SYNC_FILE_PATH,
        '\nThis content is appended using appendFileSync',
        'utf-8'
    )

    // To Read File - readFileSync(file, file-option)
    const content = fs.readFileSync(SYNC_FILE_PATH, 'utf-8')

    // To get the stats of file / folder - statSync(path)
    const stats = fs.statSync(SYNC_FILE_PATH)


    return {
        style: "sync",
        fileName: path.basename(SYNC_FILE_PATH),
        content: content,
        sizeInBytes: stats.size
    }
}


// 2) Callback
const runCallbackExample = (): Promise<FileInfo> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            CALLBACK_FILE_PATH,
            'Content is written using callback fs',
            'utf-8',
            (writeError) => {
                if (writeError) {
                    reject(`Cannot write to callback file, ${writeError}`)
                    return;
                }

                fs.appendFile(
                    CALLBACK_FILE_PATH,
                    '\nThis content is appended using appendfile to the callback content.',
                    'utf-8',
                    (appendError) => {
                        if (appendError) {
                            reject(`Error while appending the content in callback file: ${appendError}`)
                            return;
                        }

                        fs.readFile(CALLBACK_FILE_PATH, 'utf-8', (readError, content) => {
                            if (readError) {
                                reject(`Error while reading callback file: ${readError}`)
                                return;
                            }

                            fs.stat(CALLBACK_FILE_PATH, (statError, stats) => {
                                if (statError) {
                                    reject(`Error for stats in callback: ${statError}`)
                                    return;
                                }

                                resolve({
                                    style: 'callback',
                                    fileName: path.basename(CALLBACK_FILE_PATH),
                                    content: content,
                                    sizeInBytes: stats.size,
                                })
                            })
                        })
                    }
                )
            }
        )
    })
}


const main = async (): Promise<void> => {
    try {
        ensureDemoFolderExists();

        const syncResult = runSyncExample();
        const callbackResult = await runCallbackExample()

        console.log([syncResult, callbackResult]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Error'
        console.log('FS Error', errorMessage)
    }
}

main()