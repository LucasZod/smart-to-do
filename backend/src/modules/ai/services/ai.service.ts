import { Injectable } from '@nestjs/common'
import { Task } from '../../tasks/entities/task.entity'
import { Goal } from '../../goals/entities/goal.entity'
import { TasksRepository } from '../../tasks/providers/tasks.repository'
import { LlmProvider } from '../providers/llm.provider'
import { AiProviderException } from '../../../shared/exceptions/ai-provider.exception'

@Injectable()
export class AiService {
  constructor(
    private readonly llmProvider: LlmProvider,
    private readonly tasksRepository: TasksRepository
  ) {}

  async generateTasksForGoal(goal: Goal, apiKey: string): Promise<Task[]> {
    if (!apiKey) throw new AiProviderException('Chave da API é obrigatória para geração de tarefas via IA')
    const rawResponse = await this.llmProvider.complete(goal.objective, apiKey)
    const titles = parseTaskTitles(rawResponse)
    const tasks = buildAiTasks(titles, goal.id)
    return this.tasksRepository.saveMany(tasks)
  }
}

export const parseTaskTitles = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error()
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    throw new AiProviderException('Resposta da IA não é um array JSON válido')
  }
}

const buildAiTasks = (titles: string[], goalId: string): Partial<Task>[] =>
  titles.map((title) => ({ title, goalId, isCompleted: false, isAiGenerated: true }))
