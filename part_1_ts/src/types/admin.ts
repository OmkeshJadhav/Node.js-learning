import { Task } from "./task"

export type AdminTaskListResponse = {
    tasks: Task[]
}

export type AdminTaskListQuery = {
    search?: string,
    status?: string
}

export type AdminTaskListFilters = {
    search?: string,
    status?: string
}