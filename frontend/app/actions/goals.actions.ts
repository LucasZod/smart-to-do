'use server'

import { http } from '@/app/lib/fetch'
import type {
  Goal,
  Task,
  CreateGoalPayload,
  GenerateTasksPayload,
  CreateTaskPayload,
  UpdateTaskPayload
} from '@/app/types'

export async function fetchGoalsAction(): Promise<Goal[]> {
  return http.get('/goals')
}

export async function createGoalAction(payload: CreateGoalPayload): Promise<Goal> {
  return http.post('/goals', payload)
}

export async function removeGoalAction(id: string): Promise<void> {
  return http.delete(`/goals/${id}`)
}

export async function addTaskAction(goalId: string, payload: CreateTaskPayload): Promise<Task> {
  return http.post(`/goals/${goalId}/tasks`, payload)
}

export async function generateTasksAction(goalId: string, payload: GenerateTasksPayload): Promise<Task[]> {
  return http.post(`/goals/${goalId}/tasks/generate`, payload)
}

export async function regenerateTasksAction(goalId: string, payload: GenerateTasksPayload): Promise<Task[]> {
  return http.post(`/goals/${goalId}/tasks/regenerate`, payload)
}

export async function updateTaskAction(id: string, payload: UpdateTaskPayload): Promise<Task> {
  return http.patch(`/tasks/${id}`, payload)
}

export async function removeTaskAction(id: string): Promise<void> {
  return http.delete(`/tasks/${id}`)
}
