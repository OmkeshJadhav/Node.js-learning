import path from "node:path";

// process.cwd - Gives path of the project / folder
const projectRoot = process.cwd()
console.log("Current Working Dir: ", projectRoot)

// path.join - Creates path using the correct separator for correct OS. 
// path.join only creates path string and does not create folders and does not check if file exists or not

const userId = '87'
const originalFileName = 'profile_photo.png'

const uploadFilePath = path.join(
    projectRoot, 'uploads', 'user', userId, originalFileName
)

console.log("uploadFilePath: ", uploadFilePath)

// basename - Extracts final part of the path. So, useful for getting file name
const fileName = path.basename(uploadFilePath)
console.log("fileName: ", fileName)

// extname - Gives extension of the file
const extensionName = path.extname(uploadFilePath)
console.log("extensionName: ", extensionName)

// dirname - Gives the path of the parent of the file
const dirName = path.dirname(uploadFilePath)
console.log("dirName: ", dirName)