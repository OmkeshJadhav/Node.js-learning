const Image = require('../models/image-model')
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper')
const cloudinary = require("../config/cloudinary")
const fs = require('fs');
const { userInfo } = require('os');

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
        const images = await Image.find({})

        //  Pagination
        // const page = req.query.page || 1
        // const limit = req.query.limit || 10
        // const images = await Image.find({})
        // .skip((page - 1) * limit)
        // .limit(limit)

        if (images) {
            res.status(200).json({
                success: true,
                data: images
            })
        }
    } catch (error) {
        console.error(`Error uploading the image.`, error)
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
        if (image.uploadedBy.toString() !== userId) {
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

module.exports = {
    uploadImage,
    fetchImages,
    deleteImage
};