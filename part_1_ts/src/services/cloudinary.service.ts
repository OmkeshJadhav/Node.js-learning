import { cloudinary } from "../config/cloudinary";

const cloudinary_folder = "cloudinary-learning/images"

// Upload Service
export const uploadImage = (buffer: Buffer) => {
    return new Promise<{
        secure_url: string;
        public_id: string;
    }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: cloudinary_folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary returned no result"));
                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            },
        );

        // sending image bytes to cloudinary
        stream.end(buffer);
    });
}

// Delete service
// Returns Cloudinary's response, e.g. { result: "ok" } or { result: "not found" }
export async function deleteImage(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
