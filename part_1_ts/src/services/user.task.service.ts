import { AppError } from "../errors/AppError"
import { createTask, fetchTasksByUserId } from "../repositories/user.task.repository";
import { Task } from "../types/task";

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

export const getUserTasks = async (userId: string): Promise<Task[]> => {
    return fetchTasksByUserId(userId)
}