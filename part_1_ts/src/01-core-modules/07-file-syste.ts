import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs'

// fs: create/delete folder, create/write/read/delete files, check file information
// 3 Ways to work with fs: 1) sync APIs 2) Callback APIs 3) Promise APIs


// sync

const DEMO_FOLDER_PATH = path.join(process.cwd(), 'file-system', 'fs-demo')
const SYNC_FILE_PATH = path.join(DEMO_FOLDER_PATH, 'sync-note.txt')

type FileInfo = {
    style: string,
    fileName: string,
    content: string,
    sizeInBytes: number
}

const ensureDemoFolderExists = (): void => {
    if(!fs.existsSync(DEMO_FOLDER_PATH)){
        fs.mkdirSync(DEMO_FOLDER_PATH, {recursive: true})
    }
}

const runSyncExample = (): FileInfo => {
    //write content to the file - If file is doesn't exist then node will create it. But if already exists then node will replace the content.
    fs.writeFileSync(SYNC_FILE_PATH, 'This content was created using Sync file system', 'utf-8')

    // Append the content to existing content
    fs.appendFileSync(
        SYNC_FILE_PATH, 
        '\nThis content is appended using appendFileSync', 
        'utf-8'
    )

    // Read File
    const content = fs.readFileSync(SYNC_FILE_PATH, 'utf-8')

    // To get the stats of file / folder
    const stats = fs.statSync(SYNC_FILE_PATH)


    return {
        style: "sync",
        fileName: path.basename(SYNC_FILE_PATH),
        content: content,
        sizeInBytes: stats.size
    }
}


const main = async (): Promise<void> => {
    try {
        ensureDemoFolderExists();

        const syncResult = runSyncExample();
        console.log([syncResult]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Error'
        console.log('FS Error', errorMessage)
    }
}

main()