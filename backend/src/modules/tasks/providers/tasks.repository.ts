import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from '../entities/task.entity'

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>
  ) {}

  findById(id: string): Promise<Task | null> {
    return this.repo.findOneBy({ id })
  }

  save(task: Partial<Task>): Promise<Task> {
    return this.repo.save(task)
  }

  saveMany(tasks: Partial<Task>[]): Promise<Task[]> {
    return this.repo.save(tasks)
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id)
  }

  async deleteByGoalId(goalId: string): Promise<void> {
    await this.repo.delete({ goalId })
  }
}
