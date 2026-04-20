import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { AiService } from './services/ai.service'
import { LlmProvider } from './providers/llm.provider'
import { TasksModule } from '../tasks/tasks.module'

@Module({
  imports: [HttpModule, TasksModule],
  controllers: [],
  providers: [AiService, LlmProvider],
  exports: [AiService]
})
export class AiModule {}
