const express = require('express')
const authMiddleware = require('../middlewares/auth-middleware')
const authorizeRoles = require('../middlewares/admin-middleware')
const uploadMiddleware = require('../middlewares/upload-middleware')
const { uploadImage } = require('../controllers/image-controller')

const router = express.Router()

router.post(
    '/upload',
    authMiddleware,
    authorizeRoles('admin'),
    uploadMiddleware.single('image'),
    uploadImage
);

module.exports = router;