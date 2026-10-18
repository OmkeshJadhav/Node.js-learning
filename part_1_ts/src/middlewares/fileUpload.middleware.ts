import multer from "multer";
import { AppError } from "../errors/AppError";

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const upload = multer({
    storage: multer.memoryStorage(),  // temporarily holds the uploaded file in server's memory
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith("image/")) {
            callback(null, true);
        } else {
            callback(new AppError(400, "Only image files are allowed"));
        }
    },
});