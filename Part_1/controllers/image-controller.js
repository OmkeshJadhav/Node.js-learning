const mongoose = require('mongoose')
const Image = require('../models/image-model')
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper')
const cloudinary = require("../config/cloudinary")
const fs = require('fs');

const uploadImage = async (req, res) => {
    try {
        // Check if file is missing in req object
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: `File is missing. Please upload a file.`
            })
        }

        // Upoad file to cloudinary
        const { url, publicId, resourceType } = await uploadToCloudinary(req.file.path)
        // ------ NEED TO ADD CLEAN UP IF UPLOAD FAILS

        // Store image url, publicId, resourceType and uploadedBy to DB
        const newlyUploadedImage = new Image({
            url,
            publicId,
            resourceType,
            uploadedBy: req.userInfo.userId
        })

        await newlyUploadedImage.save()

        // delete file from local storage after uploading to cloudinary
        await fs.promises.unlink(req.file.path);

        res.status(201).json({
            success: true,
            message: `Image uploaded successfully`,
            data: {
                image: newlyUploadedImage
            }
        })

    } catch (error) {
        console.error(`Error uploading the image.`, error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong! Please try again.'
        })
    }
}

const fetchImages = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 3, 1), 50)
        const skip = (page - 1) * limit

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1
        const sortObj = { [sortBy]: sortOrder }

        const [totalImages, images] = await Promise.all([
            Image.countDocuments(),
            Image.find()
                .skip(skip)
                .limit(limit)
                .sort(sortObj)
                .lean()   // Faster + less memory
        ])

        const totalPages = Math.ceil(totalImages / limit)

        if (images.length === 0) {
            res.status(400).json({
                success: true,
                message: 'No images found',
                data: []
            })
        } else {
            res.status(200).json({
                success: true,
                currentPage: page,
                totalImages,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                data: images
            })
        }
    } catch (error) {
        console.error(`Error fetching images.`, error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong! Please try again.'
        })
    }
}

const deleteImage = async (req, res) => {
    // Delete from DB & Cloudinary
    // Image Id
    // User ID
    // Auth mw + Admin role - Who can delete

    try {
        const imageIdToBeDeleted = req.params.id
        const userId = req.userInfo.userId

        // Find image using imageId and Fetch only required fields
        const image = await Image.findById(imageIdToBeDeleted).select('publicId uploadedBy')

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found.'
            })
        }

        // Check if image is uploaded by the same user who is trying to delete it
        if (image.uploadedBy.toString() !== userId && req.userInfo.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `You are not authorized to delete this image becuase you haven't uploaded it.`
            })
        }

        // Delet from cloudinary storage
        const cloudinaryDeleteResult = await cloudinary.uploader.destroy(image.publicId)

        // verify deletion from cloudinary
        if (cloudinaryDeleteResult.result !== 'ok' && cloudinaryDeleteResult.result !== 'not found') {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete image from cloud storage.'
            })
        }

        // Delete image from DB
        await Image.findByIdAndDelete(imageIdToBeDeleted)

        res.status(200).json({
            success: true,
            message: `Image delete successfully.`
        })

    } catch (error) {
        console.error(`Error deleting the image.`, error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong! Please try again.'
        })
    }
}

const bulkDeleteImages = async (req, res) => {
    try {
        const { imageIds } = req.body
        const userId = req.userInfo.userId
        const userRole = req.userInfo.role


        // 1. Validate input
        if (!Array.isArray(imageIds) || imageIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'imageIds must be a non-empty array'
            })
        }

        // 2. Limit Bulk Size
        if (imageIds.length > 50) {
            return res.status(400).json({
                message: 'Max 50 images allowed per request'
            })
        }

        // 3. Validate ObjectIds
        const validIds = imageIds.filter(id => mongoose.Types.ObjectId.isValid(id))

        if (validIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid image IDs provided'
            })
        }

        // 4. Fetch images
        const images = await Image.find({ _id: { $in: validIds } })
            .select('publicId uploadedBy')

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No images found'
            })
        }

        // 5. Filter authorized images
        const authorizedImages = images.filter(img =>
            img.uploadedBy.toString() === userId || userRole === 'admin'
        )

        if (authorizedImages.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete these images'
            })
        }

        // 6. Extract publicIds
        const publicIds = authorizedImages.map(img => img.publicId)

        // 7. Delete from Cloudinary (bulk)
        const cloudinaryResult = await cloudinary.api.delete_resources(publicIds)

        const failedDeletes = Object.entries(cloudinaryResult.deleted)
            .filter(([_, status]) => status !== 'deleted' && status !== 'not_found')

        const deletedMap = cloudinaryResult.deleted

        const successfulPublicIds = Object.keys(deletedMap).filter(
            key => deletedMap[key] === 'deleted' || deletedMap[key] === 'not_found'
        )

        // 8. Delete from DB
        const idsToDelete = authorizedImages
            .filter(img => successfulPublicIds.includes(img.publicId))
            .map(img => img._id)

        await Image.deleteMany({ _id: { $in: idsToDelete } })

        res.status(200).json({
            success: true,
            message: 'Images deleted successfully',
            deletedCount: idsToDelete.length,
            failedDeletes,
            cloudinaryResult
        })

    } catch (error) {
        console.error('Bulk delete error:', error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

module.exports = {
    uploadImage,
    fetchImages,
    deleteImage,
    bulkDeleteImages
};