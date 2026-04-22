import { Injectable } from '@nestjs/common'
import { Task } from '../../tasks/entities/task.entity'
import { Goal } from '../../goals/entities/goal.entity'
import { TasksRepository } from '../../tasks/providers/tasks.repository'
import { LlmProvider } from '../providers/llm.provider'
import { AiProviderException } from '../../../shared/exceptions/ai-provider.exception'
import { AI_CONFIG } from '../constants/ai.constants'

@Injectable()
export class AiService {
  constructor(
    private readonly llmProvider: LlmProvider,
    private readonly tasksRepository: TasksRepository
  ) { }

  async generateTasksForGoal(goal: Goal, apiKey: string): Promise<Task[]> {
    if (!apiKey) throw new AiProviderException('Chave da API é obrigatória para geração de tarefas via IA')
    const rawResponse = await this.llmProvider.complete(goal.objective, apiKey)
    const titles = parseTaskTitles(rawResponse)
    const tasks = buildAiTasks(titles, goal.id)
    return this.tasksRepository.saveMany(tasks)
  }
}

export const parseTaskTitles = (raw: string): string[] => {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new AiProviderException('Resposta da IA não é um JSON válido')
  }

  if (!Array.isArray(parsed)) {
    throw new AiProviderException('Resposta da IA não é um array JSON válido')
  }

  const validTasks = parsed
    .filter((item): item is string => typeof item === 'string')
    .map((title) => title.trim())
    .filter((title) => title.length >= AI_CONFIG.MIN_TASK_TITLE_LENGTH)
    .map((title) => title.slice(0, AI_CONFIG.MAX_TASK_TITLE_LENGTH))
    .slice(0, AI_CONFIG.MAX_TASKS)

  if (validTasks.length < AI_CONFIG.MIN_TASKS) {
    throw new AiProviderException(
      `A IA não retornou tarefas válidas suficientes. Esperado: pelo menos ${AI_CONFIG.MIN_TASKS}, recebido: ${validTasks.length}`
    )
  }

  return validTasks
}

const buildAiTasks = (titles: string[], goalId: string): Partial<Task>[] =>
  titles.map((title) => ({ title, goalId, isCompleted: false, isAiGenerated: true }))
