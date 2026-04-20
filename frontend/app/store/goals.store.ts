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
    resetForm: () => set({ form: initialForm }),
    clearError: () => set({ error: null })
  }))
}

export const createGoal = async () => {
  const { form } = useGoalsStore.getState()
  const isAi = form.generateWithAi

  useGoalsStore.setState(isAi ? { isAiLoading: true, error: null } : { isLoading: true, error: null })
  try {
    await createGoalAction({
      objective: form.objective,
      generateWithAi: isAi,
      apiKey: isAi ? form.apiKey : undefined
    })
    useGoalsStore.setState({ form: initialForm })
  } catch (err) {
    useGoalsStore.setState({ error: extractError(err) })
  } finally {
    const goals = await fetchGoalsAction()
    useGoalsStore.setState({ isLoading: false, isAiLoading: false, goals })
  }
}

export const removeGoal = async (id: string) => {
  useGoalsStore.setState({ isLoading: true, error: null })
  try {
    await removeGoalAction(id)
    useGoalsStore.setState((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) }))
  } catch {
    useGoalsStore.setState({ error: 'Falha ao deletar objetivo' })
  } finally {
    useGoalsStore.setState({ isLoading: false })
  }
}

export const addTask = async (goalId: string, payload: CreateTaskPayload) => {
  try {
    const task = await addTaskAction(goalId, payload)
    useGoalsStore.setState((state) => ({
      goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, tasks: [...goal.tasks, task] } : goal))
    }))
  } catch {
    useGoalsStore.setState({ error: 'Falha ao adicionar tarefa' })
  }
}

export const generateTasks = async (goalId: string, payload: GenerateTasksPayload) => {
  useGoalsStore.setState({ isAiLoading: true, error: null })
  try {
    const tasks = await generateTasksAction(goalId, payload)
    useGoalsStore.setState((state) => ({
      goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, tasks: [...goal.tasks, ...tasks] } : goal))
    }))
  } catch (err) {
    useGoalsStore.setState({ error: extractError(err) })
  } finally {
    useGoalsStore.setState({ isAiLoading: false })
  }
}

export const regenerateTasks = async (goalId: string, payload: GenerateTasksPayload) => {
  useGoalsStore.setState({ isAiLoading: true, error: null })
  try {
    const tasks = await regenerateTasksAction(goalId, payload)
    useGoalsStore.setState((state) => ({
      goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, tasks } : goal))
    }))
  } catch (err) {
    useGoalsStore.setState({ error: extractError(err) })
  } finally {
    useGoalsStore.setState({ isAiLoading: false })
  }
}

export const toggleTask = async (goalId: string, task: Task) => {
  useGoalsStore.setState((state) => ({
    goals: state.goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, tasks: goal.tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t)) }
        : goal
    )
  }))
  try {
    await updateTaskAction(task.id, { isCompleted: !task.isCompleted })
  } catch {
    useGoalsStore.setState((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, tasks: goal.tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t)) }
          : goal
      )
    }))
    useGoalsStore.setState({ error: 'Falha ao atualizar tarefa' })
  }
}

export const removeTask = async (goalId: string, taskId: string) => {
  try {
    await removeTaskAction(taskId)
    useGoalsStore.setState((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId ? { ...goal, tasks: goal.tasks.filter((t) => t.id !== taskId) } : goal
      )
    }))
  } catch {
    useGoalsStore.setState({ error: 'Falha ao deletar tarefa' })
  }
}

const extractError = (err: unknown): string => {
  if (err instanceof Error) return err.message
  return 'Algo deu errado'
}
