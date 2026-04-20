export interface Task {
  id: string
  title: string
  isCompleted: boolean
  isAiGenerated: boolean
  goalId: string
  createdAt: string
}

export interface Goal {
  id: string
  objective: string
  tasks: Task[]
  createdAt: string
}

export interface CreateGoalPayload {
  objective: string
  generateWithAi: boolean
  apiKey?: string
}

export interface GenerateTasksPayload {
  apiKey: string
}

export interface CreateTaskPayload {
  title: string
}

export interface UpdateTaskPayload {
  title?: string
  isCompleted?: boolean
}
