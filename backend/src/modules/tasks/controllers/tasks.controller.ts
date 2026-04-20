import { Controller, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TasksService } from '../services/tasks.service'
import { UpdateTaskDto } from '../dto/update-task.dto'

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar título ou status de conclusão da tarefa' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar uma tarefa' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id)
  }
}
