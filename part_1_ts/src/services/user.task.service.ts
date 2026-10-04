import { AppError } from "../errors/AppError"
import { createTask } from "../repositories/user.task.repository";

const validateTitle = (title: unknown): string => {
    if(typeof title !== 'string' || !title.trim()){
        throw new AppError(400, 'Valid title is required.')
    }

    const trimmedTitle = title.trim();

    if(trimmedTitle.length > 150){
        throw new AppError(400, 'Title must be less than 150 characters')
    }

    return trimmedTitle
}

export const createUserTask = async (userId: string, title: unknown) => {
    const validTitle = validateTitle(title)

    return createTask(userId, validTitle)
}