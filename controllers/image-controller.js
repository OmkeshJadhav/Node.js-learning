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

        // Store image url, publicId, resourceType and uploadedBy to DB
        const newlyUploaedImage = new Image({
            url,
            publicId,
            resourceType,
            uploadedBy: req.userInfo.userId
        })

        await newlyUploaedImage.save()

        // delete file from local storage after uploading to cloudinary
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success: true,
            message: `Image uploaded successfully`,
            data: {
                image: newlyUploaedImage
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

module.exports = {
    uploadImage
};