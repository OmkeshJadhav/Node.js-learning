const multer = require('multer')
const path = require('path')

// File storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname)
        cb(null, file.fieldname + "-" + uniqueSuffix)
    }
})
        // Currently using diskStorage but best practice is to use memoryStorage

// Filter for File type
const checkFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error('File uploaded is not an image. Please upload only image.'))
    }
}

const fileSizeLimit = {
    fileSize: 5 * 1024 * 1024 // 5MB
}

module.exports = multer ({
    storage: storage,
    fileFilter: checkFilter,
    limits: fileSizeLimit
})