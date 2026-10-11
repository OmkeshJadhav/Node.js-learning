import { AppError } from "../errors/AppError";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const validateTaskId = (taskId: string): void => {
    if (!UUID_REGEX.test(taskId)) {
        throw new AppError(400, 'Invalid task id.')
    }
}
