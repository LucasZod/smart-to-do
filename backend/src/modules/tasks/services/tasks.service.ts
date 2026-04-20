import { Injectable, NotFoundException } from '@nestjs/common'
import { Task } from '../entities/task.entity'
import { TasksRepository } from '../providers/tasks.repository'
import { UpdateTaskDto } from '../dto/update-task.dto'

const applyUpdates = (task: Task, dto: UpdateTaskDto): Task => ({
  ...task,
  ...(dto.title !== undefined && { title: dto.title }),
  ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted })
})

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOneOrFail(id)
    const updated = applyUpdates(task, dto)
    return this.tasksRepository.save(updated)
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrFail(id)
    await this.tasksRepository.deleteById(id)
  }

  async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findById(id)
    if (!task) throw new NotFoundException(`Tarefa ${id} não encontrada`)
    return task
  }
}
