import { Injectable, NotFoundException } from '@nestjs/common'
import { Goal } from '../entities/goal.entity'
import { Task } from '../../tasks/entities/task.entity'
import { GoalsRepository } from '../providers/goals.repository'
import { TasksRepository } from '../../tasks/providers/tasks.repository'
import { AiService } from '../../ai/services/ai.service'
import { CreateGoalDto } from '../dto/create-goal.dto'
import { CreateTaskManualDto } from '../dto/create-task-manual.dto'

const buildManualTask = (title: string, goalId: string): Partial<Task> => ({
  title,
  goalId,
  isCompleted: false,
  isAiGenerated: false
})

@Injectable()
export class GoalsService {
  constructor(
    private readonly goalsRepository: GoalsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly aiService: AiService
  ) { }

  async create(dto: CreateGoalDto): Promise<Goal> {
    const goal = await this.goalsRepository.save({ objective: dto.objective.toUpperCase() })
    if (dto.generateWithAi) await this.aiService.generateTasksForGoal(goal, dto.apiKey!)
    return this.goalsRepository.findById(goal.id) as Promise<Goal>
  }

  findAll(): Promise<Goal[]> {
    return this.goalsRepository.findAll()
  }

  async findOneOrFail(id: string): Promise<Goal> {
    const goal = await this.goalsRepository.findById(id)
    if (!goal) throw new NotFoundException(`Objetivo ${id} não encontrado`)
    return goal
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrFail(id)
    await this.goalsRepository.deleteById(id)
  }

  async addTask(goalId: string, dto: CreateTaskManualDto): Promise<Task> {
    await this.findOneOrFail(goalId)
    return this.tasksRepository.save(buildManualTask(dto.title, goalId))
  }

  async generateTasks(goalId: string, apiKey: string): Promise<Task[]> {
    const goal = await this.findOneOrFail(goalId)
    return this.aiService.generateTasksForGoal(goal, apiKey)
  }

  async regenerateTasks(goalId: string, apiKey: string): Promise<Task[]> {
    const goal = await this.findOneOrFail(goalId)
    await this.tasksRepository.deleteByGoalId(goalId)
    return this.aiService.generateTasksForGoal(goal, apiKey)
  }
}
