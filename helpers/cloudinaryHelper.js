const cloudinary = require("../config/cloudinary")

const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath)

        console.log(result)

        return {
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
        }
    } catch (error) {
        console.error(`Error while uploading to the cloudinary`, error)
        throw error;
    }
}

module.exports = {
    uploadToCloudinary
}