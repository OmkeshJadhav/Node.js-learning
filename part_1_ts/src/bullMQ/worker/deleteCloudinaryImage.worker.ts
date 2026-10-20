import { Worker } from "bullmq"
import { bullmqConnection, DELETE_CLOUDINARY_IMAGE_QUEUE } from "../connection"
import { deleteImage } from "../../services/cloudinary.service"

const deleteCloudinaryImageWorker = () => {
    const worker = new Worker(DELETE_CLOUDINARY_IMAGE_QUEUE,
        async (job) => {
            const { publicId } = job.data;

            const res = await deleteImage(publicId)  // From cloudinary service

            // Cloudinary doesn't throw on failure - it returns a result string.
            // "not found" means the image is already gone, so retrying won't help.
            if (res.result !== "ok" && res.result !== "not found") {
                throw new Error(`Cloudinary delete failed: ${res.result}`)  // triggers a retry
            }

            // Whatever is returned here shows up as `result` in the "completed" event
            return { publicId, result: res.result }
        },
        {
            connection: bullmqConnection
        }
    )
    worker.on("completed", (job, result) => {
        console.log(`Job ${job.id} completed`, result)
    })

    worker.on('failed', (job, error) => {
        console.log(`Job ${job?.id} failed`, error.message)
    })

    console.log(`Worker ${worker.name} is running and waiting for jobs`)
}

deleteCloudinaryImageWorker()
