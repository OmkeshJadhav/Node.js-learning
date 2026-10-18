import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/fileUpload.middleware";
import { removeUserAvatar, uploadUserAvatar } from "../services/file.upload.service";
import { AppError } from "../errors/AppError";

export const fileUploadRouter = Router();

fileUploadRouter.use(authenticate)

fileUploadRouter.post('/image', upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError(400, "Image file is required");
        }

        const avatar = await uploadUserAvatar(req.user!.userId, req.file.buffer);

        res.status(201).json({
            success: true,
            data: { avatar },
        });
    } catch (error) {
        next(error);
    }
});

fileUploadRouter.delete('/image', async (req, res, next) => {
    try {
        await removeUserAvatar(req.user!.userId);

        res.status(200).json({
            success: true,
            message: "Avatar deleted successfully",
        });
    } catch (error) {
        next(error);
    }
});


// upload.single("image") has multer read one file from the form field named image and put it in req.file.