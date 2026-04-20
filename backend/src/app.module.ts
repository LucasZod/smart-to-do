import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoalsModule } from './modules/goals/goals.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { AiModule } from './modules/ai/ai.module'
import { Goal } from './modules/goals/entities/goal.entity'
import { Task } from './modules/tasks/entities/task.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'todo.db',
      entities: [Goal, Task],
      synchronize: true
    }),
    GoalsModule,
    TasksModule,
    AiModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
