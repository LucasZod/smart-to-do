import { create, StoreApi, UseBoundStore } from 'zustand'
import type { Goal, Task, CreateTaskPayload, GenerateTasksPayload } from '@/app/types'
import {
  fetchGoalsAction,
  createGoalAction,
  removeGoalAction,
  addTaskAction,
  generateTasksAction,
  regenerateTasksAction,
  updateTaskAction,
  removeTaskAction
} from '@/app/actions/goals.actions'

export interface GoalsStoreProps {
  goals: Goal[]
  isLoading: boolean
  isAiLoading: boolean
  error: string | null
  searchTerm: string
  form: {
    objective: string
    apiKey: string
    generateWithAi: boolean
  }
}

export interface GoalsStore extends GoalsStoreProps {
  setObjective: (value: string) => void
  setApiKey: (value: string) => void
  setGenerateWithAi: (value: boolean) => void
  setSearchTerm: (value: string) => void
  resetForm: () => void
  clearError: () => void
}

const initialForm = {
  objective: '',
  apiKey: '',
  generateWithAi: false
}

const initialState: GoalsStoreProps = {
  goals: [],
  isLoading: false,
  isAiLoading: false,
  error: null,
  searchTerm: '',
  form: initialForm
}

export let useGoalsStore: UseBoundStore<StoreApi<GoalsStore>>

export function initializeStore({ initialValues }: { initialValues?: Partial<GoalsStoreProps> }) {
  useGoalsStore = create<GoalsStore>((set) => ({
    ...initialState,
    ...initialValues,
    setObjective: (value: string) => set((state) => ({ form: { ...state.form, objective: value } })),
    setApiKey: (value: string) => set((state) => ({ form: { ...state.form, apiKey: value } })),
    setGenerateWithAi: (value: boolean) => set((state) => ({ form: { ...state.form, generateWithAi: value } })),
    setSearchTerm: (value: string) => set({ searchTerm: value }),
    resetForm: () => set({ form: initialForm }),
    clearError: () => set({ error: null })
  }))
}

export const createGoal = async () => {
  const { form } = useGoalsStore.getState()
  const isAi = form.generateWithAi

  useGoalsStore.setState(isAi ? { isAiLoading: true, error: null } : { isLoading: true, error: null })

  const result = await createGoalAction({
    objective: form.objective,
    generateWithAi: isAi,
    apiKey: isAi ? form.apiKey : undefined
  })

  const goalsResult = await fetchGoalsAction()
  if (goalsResult.success) useGoalsStore.setState({ goals: goalsResult.data })

  if (!result.success) {
    useGoalsStore.setState({ isLoading: false, isAiLoading: false, error: result.error })
    return
  }

  useGoalsStore.setState({ form: initialForm, isLoading: false, isAiLoading: false })
}

export const removeGoal = async (id: string) => {
  useGoalsStore.setState({ isLoading: true, error: null })

  const result = await removeGoalAction(id)

  if (!result.success) {
    useGoalsStore.setState({ isLoading: false, error: result.error })
    return
  }

  useGoalsStore.setState((state) => ({ isLoading: false, goals: state.goals.filter((goal) => goal.id !== id) }))
}

export const addTask = async (goalId: string, payload: CreateTaskPayload) => {
  const result = await addTaskAction(goalId, payload)

  if (!result.success) {
    useGoalsStore.setState({ error: result.error })
    return
  }

  useGoalsStore.setState((state) => ({
    goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, tasks: [...goal.tasks, result.data] } : goal))
  }))
}

export const generateTasks = async (goalId: string, payload: GenerateTasksPayload) => {
  useGoalsStore.setState({ isAiLoading: true, error: null })

  const result = await generateTasksAction(goalId, payload)

  if (!result.success) {
    useGoalsStore.setState({ isAiLoading: false, error: result.error })
    return
  }

  useGoalsStore.setState((state) => ({
    isAiLoading: false,
    goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, tasks: [...goal.tasks, ...result.data] } : goal))
  }))
}

export const regenerateTasks = async (goalId: string, payload: GenerateTasksPayload) => {
  useGoalsStore.setState({ isAiLoading: true, error: null })

  const result = await regenerateTasksAction(goalId, payload)

  if (!result.success) {
    useGoalsStore.setState({ isAiLoading: false, error: result.error })
    return
  }

  useGoalsStore.setState((state) => ({
    isAiLoading: false,
    goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, tasks: result.data } : goal))
  }))
}

export const toggleTask = async (goalId: string, task: Task) => {
  useGoalsStore.setState((state) => ({
    goals: state.goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, tasks: goal.tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t)) }
        : goal
    )
  }))

  const result = await updateTaskAction(task.id, { isCompleted: !task.isCompleted })

  if (!result.success) {
    useGoalsStore.setState((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, tasks: goal.tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t)) }
          : goal
      )
    }))
    useGoalsStore.setState({ error: result.error })
  }
}

export const removeTask = async (goalId: string, taskId: string) => {
  const result = await removeTaskAction(taskId)

  if (!result.success) {
    useGoalsStore.setState({ error: result.error })
    return
  }

  useGoalsStore.setState((state) => ({
    goals: state.goals.map((goal) =>
      goal.id === goalId ? { ...goal, tasks: goal.tasks.filter((t) => t.id !== taskId) } : goal
    )
  }))
}
