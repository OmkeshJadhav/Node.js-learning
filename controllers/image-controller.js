const Image = require('../models/image-model')
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper')
const fs = require('fs');

const uploadImage = async (req, res) => {
    try {
        // Check if file is missing in req object
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: `File is missing. Please upload a file.`
            })
        }
        
        // Upoad file to cloudinary
        const {url, publicId, resourceType} = await uploadToCloudinary(req.file.path)
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

        if(images){
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

module.exports = {
    uploadImage,
    fetchImages
};