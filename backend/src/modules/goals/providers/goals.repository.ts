import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Goal } from '../entities/goal.entity'

@Injectable()
export class GoalsRepository {
  constructor(
    @InjectRepository(Goal)
    private readonly repo: Repository<Goal>
  ) { }

  findAll(): Promise<Goal[]> {
    return this.repo.find()
  }

  findById(id: string): Promise<Goal | null> {
    return this.repo.findOneBy({ id })
  }

  save(goal: Partial<Goal>): Promise<Goal> {
    return this.repo.save(goal)
  }

  findByObjective(objective: string): Promise<Goal | null> {
    return this.repo.findOneBy({ objective })
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id)
  }
}
