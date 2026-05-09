const express = require('express')
const authMiddleware = require('../middlewares/auth-middleware')
const authorizeRoles = require('../middlewares/admin-middleware')
const uploadMiddleware = require('../middlewares/upload-middleware')
const { uploadImage, fetchImages, deleteImage, bulkDeleteImages } = require('../controllers/image-controller')

const router = express.Router()

router.post(
    '/upload',
    authMiddleware,
    authorizeRoles('admin'),
    uploadMiddleware.single('image'),
    uploadImage
);

router.get('/', authMiddleware, fetchImages)

router.delete('/', authMiddleware, bulkDeleteImages)

router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteImage)

module.exports = router;