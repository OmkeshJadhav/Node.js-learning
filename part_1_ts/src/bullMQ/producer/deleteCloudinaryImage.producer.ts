import { Queue } from "bullmq";
import { bullmqConnection, DELETE_CLOUDINARY_IMAGE_QUEUE } from "../connection";

// 1. Create the Queue once - every call reuses the same Redis connection
const deleteCloudinaryImageQueue = new Queue(DELETE_CLOUDINARY_IMAGE_QUEUE, { connection: bullmqConnection });

export const deleteCloudinaryImageProducer = async(publicId: string): Promise<void> => {
    // 2. Add job to the queue
    await deleteCloudinaryImageQueue.add(
        "delete-cloudinary-image",
        { publicId },
        {attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            },
            removeOnComplete: true,
            removeOnFail: false
        }
    )
}
