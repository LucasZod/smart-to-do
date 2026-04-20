import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './entities/task.entity'
import { TasksController } from './controllers/tasks.controller'
import { TasksService } from './services/tasks.service'
import { TasksRepository } from './providers/tasks.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksRepository]
})
export class TasksModule {}
