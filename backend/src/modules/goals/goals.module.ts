import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Goal } from './entities/goal.entity'
import { GoalsController } from './controllers/goals.controller'
import { GoalsService } from './services/goals.service'
import { GoalsRepository } from './providers/goals.repository'
import { TasksModule } from '../tasks/tasks.module'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [TypeOrmModule.forFeature([Goal]), TasksModule, AiModule],
  controllers: [GoalsController],
  providers: [GoalsService, GoalsRepository]
})
export class GoalsModule {}
