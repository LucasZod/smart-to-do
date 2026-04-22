'use server'

import { http, ApiError } from '@/lib/fetch'
import type {
  Goal,
  Task,
  CreateGoalPayload,
  GenerateTasksPayload,
  CreateTaskPayload,
  UpdateTaskPayload
} from '@/types'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

const handleError = (error: unknown): string => {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Erro desconhecido ao processar a requisição'
}

export async function fetchGoalsAction(): Promise<ActionResult<Goal[]>> {
  try {
    const data = await http.get<Goal[]>('/goals')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function createGoalAction(payload: CreateGoalPayload): Promise<ActionResult<Goal>> {
  try {
    const data = await http.post<Goal>('/goals', payload)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function removeGoalAction(id: string): Promise<ActionResult<void>> {
  try {
    await http.delete<void>(`/goals/${id}`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function addTaskAction(goalId: string, payload: CreateTaskPayload): Promise<ActionResult<Task>> {
  try {
    const data = await http.post<Task>(`/goals/${goalId}/tasks`, payload)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function generateTasksAction(
  goalId: string,
  payload: GenerateTasksPayload
): Promise<ActionResult<Task[]>> {
  try {
    const data = await http.post<Task[]>(`/goals/${goalId}/tasks/generate`, payload)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function regenerateTasksAction(
  goalId: string,
  payload: GenerateTasksPayload
): Promise<ActionResult<Task[]>> {
  try {
    const data = await http.post<Task[]>(`/goals/${goalId}/tasks/regenerate`, payload)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function updateTaskAction(id: string, payload: UpdateTaskPayload): Promise<ActionResult<Task>> {
  try {
    const data = await http.patch<Task>(`/tasks/${id}`, payload)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}

export async function removeTaskAction(id: string): Promise<ActionResult<void>> {
  try {
    await http.delete<void>(`/tasks/${id}`)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: handleError(error) }
  }
}
