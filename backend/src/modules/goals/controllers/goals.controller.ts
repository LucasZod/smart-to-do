import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { GoalsService } from '../services/goals.service'
import { CreateGoalDto } from '../dto/create-goal.dto'
import { GenerateTasksDto } from '../dto/generate-tasks.dto'
import { CreateTaskManualDto } from '../dto/create-task-manual.dto'

@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um objetivo. Passe generateWithAi: true para gerar tarefas automaticamente' })
  @ApiResponse({ status: 201, description: 'Objetivo criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 422, description: 'Resposta da IA não pôde ser processada' })
  @ApiResponse({ status: 503, description: 'Provedor de IA indisponível' })
  create(@Body() dto: CreateGoalDto) {
    return this.goalsService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os objetivos com suas tarefas' })
  findAll() {
    return this.goalsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um objetivo com suas tarefas' })
  @ApiResponse({ status: 404, description: 'Objetivo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.goalsService.findOneOrFail(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um objetivo e todas as suas tarefas' })
  @ApiResponse({ status: 404, description: 'Objetivo não encontrado' })
  remove(@Param('id') id: string) {
    return this.goalsService.remove(id)
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Adicionar uma tarefa manualmente a um objetivo' })
  @ApiResponse({ status: 404, description: 'Objetivo não encontrado' })
  addTask(@Param('id') id: string, @Body() dto: CreateTaskManualDto) {
    return this.goalsService.addTask(id, dto)
  }

  @Post(':id/tasks/generate')
  @ApiOperation({ summary: 'Gerar tarefas via IA para um objetivo existente' })
  @ApiResponse({ status: 404, description: 'Objetivo não encontrado' })
  @ApiResponse({ status: 422, description: 'Resposta da IA não pôde ser processada' })
  @ApiResponse({ status: 503, description: 'Provedor de IA indisponível' })
  generateTasks(@Param('id') id: string, @Body() dto: GenerateTasksDto) {
    return this.goalsService.generateTasks(id, dto.apiKey)
  }

  @Post(':id/tasks/regenerate')
  @ApiOperation({ summary: 'Deletar todas as tarefas e regenerar via IA' })
  @ApiResponse({ status: 404, description: 'Objetivo não encontrado' })
  @ApiResponse({ status: 422, description: 'Resposta da IA não pôde ser processada' })
  @ApiResponse({ status: 503, description: 'Provedor de IA indisponível' })
  regenerateTasks(@Param('id') id: string, @Body() dto: GenerateTasksDto) {
    return this.goalsService.regenerateTasks(id, dto.apiKey)
  }
}
