import { AppError } from "../errors/AppError"
import { createTask, fetchTaskByTaskId, fetchTasksByUserId } from "../repositories/user.task.repository";
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const validateTaskId = (taskId: string): void => {
    if(!UUID_REGEX.test(taskId)){
        throw new AppError(400, 'Invalid task id.')
    }
}

export const createUserTask = async (userId: string, title: unknown) => {
    const validTitle = validateTitle(title)

    return createTask(userId, validTitle)
}

export const getUserTasks = async (userId: string): Promise<Task[]> => {
    return fetchTasksByUserId(userId)
}

export const getUserTaskById = async (userId: string, taskId: string): Promise<Task | null> => {
    validateTaskId(taskId)

    const task = await fetchTaskByTaskId(taskId, userId)
    
    if(!task){
        throw new AppError(404, 'Task not found!')
    }
    
    return task;
}