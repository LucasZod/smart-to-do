import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { GoalsService } from './goals.service'
import { GoalsRepository } from '../providers/goals.repository'
import { TasksRepository } from '../../tasks/providers/tasks.repository'
import { AiService } from '../../ai/services/ai.service'
import { Goal } from '../entities/goal.entity'
import { Task } from '../../tasks/entities/task.entity'

describe('GoalsService', () => {
  let service: GoalsService

  const mockGoal: Goal = {
    id: '123',
    objective: 'PLAN A TRIP',
    tasks: [],
    createdAt: new Date()
  }

  const mockTask: Task = {
    id: '456',
    title: 'Book flights',
    isCompleted: false,
    isAiGenerated: false,
    goalId: '123',
    goal: mockGoal,
    createdAt: new Date()
  }

  const mockGoalsRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn()
  }

  const mockTasksRepository = {
    save: jest.fn(),
    deleteByGoalId: jest.fn()
  }

  const mockAiService = {
    generateTasksForGoal: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: GoalsRepository,
          useValue: mockGoalsRepository
        },
        {
          provide: TasksRepository,
          useValue: mockTasksRepository
        },
        {
          provide: AiService,
          useValue: mockAiService
        }
      ]
    }).compile()

    service = module.get<GoalsService>(GoalsService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a goal without AI and not call aiService', async () => {
      const dto = { objective: 'PLAN A TRIP', generateWithAi: false }
      const goalWithTasks = { ...mockGoal, tasks: [] }

      mockGoalsRepository.save.mockResolvedValue(mockGoal)
      mockGoalsRepository.findById.mockResolvedValue(goalWithTasks)

      const result = await service.create(dto)

      expect(result).toEqual(goalWithTasks)
      expect(mockGoalsRepository.save).toHaveBeenCalledWith({ objective: 'PLAN A TRIP' })
      expect(mockAiService.generateTasksForGoal).not.toHaveBeenCalled()
      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
    })

    it('should create a goal with AI and call aiService.generateTasksForGoal', async () => {
      const dto = { objective: 'PLAN A TRIP', generateWithAi: true, apiKey: 'test-key' }
      const goalWithTasks = { ...mockGoal, tasks: [mockTask] }

      mockGoalsRepository.save.mockResolvedValue(mockGoal)
      mockAiService.generateTasksForGoal.mockResolvedValue([mockTask])
      mockGoalsRepository.findById.mockResolvedValue(goalWithTasks)

      const result = await service.create(dto)

      expect(result).toEqual(goalWithTasks)
      expect(mockGoalsRepository.save).toHaveBeenCalledWith({ objective: 'PLAN A TRIP' })
      expect(mockAiService.generateTasksForGoal).toHaveBeenCalledWith(mockGoal, 'test-key')
      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
    })
  })

  describe('findAll', () => {
    it('should return all goals', async () => {
      const goals = [mockGoal]
      mockGoalsRepository.findAll.mockResolvedValue(goals)

      const result = await service.findAll()

      expect(result).toEqual(goals)
      expect(mockGoalsRepository.findAll).toHaveBeenCalled()
    })
  })

  describe('findOneOrFail', () => {
    it('should return goal when it exists', async () => {
      mockGoalsRepository.findById.mockResolvedValue(mockGoal)

      const result = await service.findOneOrFail('123')

      expect(result).toEqual(mockGoal)
      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
    })

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalsRepository.findById.mockResolvedValue(null)

      await expect(service.findOneOrFail('123')).rejects.toThrow(NotFoundException)
      await expect(service.findOneOrFail('123')).rejects.toThrow('Objetivo 123 não encontrado')
    })
  })

  describe('remove', () => {
    it('should delete goal when it exists', async () => {
      mockGoalsRepository.findById.mockResolvedValue(mockGoal)
      mockGoalsRepository.deleteById.mockResolvedValue(undefined)

      await service.remove('123')

      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
      expect(mockGoalsRepository.deleteById).toHaveBeenCalledWith('123')
    })

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalsRepository.findById.mockResolvedValue(null)

      await expect(service.remove('123')).rejects.toThrow(NotFoundException)
      await expect(service.remove('123')).rejects.toThrow('Objetivo 123 não encontrado')
    })
  })

  describe('addTask', () => {
    it('should verify goal existence before saving task', async () => {
      const dto = { title: 'Book flights' }
      mockGoalsRepository.findById.mockResolvedValue(mockGoal)
      mockTasksRepository.save.mockResolvedValue(mockTask)

      const result = await service.addTask('123', dto)

      expect(result).toEqual(mockTask)
      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
      expect(mockTasksRepository.save).toHaveBeenCalledWith({
        title: 'Book flights',
        goalId: '123',
        isCompleted: false,
        isAiGenerated: false
      })
    })

    it('should throw NotFoundException when goal does not exist', async () => {
      const dto = { title: 'Book flights' }
      mockGoalsRepository.findById.mockResolvedValue(null)

      await expect(service.addTask('123', dto)).rejects.toThrow(NotFoundException)
      await expect(service.addTask('123', dto)).rejects.toThrow('Objetivo 123 não encontrado')
    })
  })

  describe('generateTasks', () => {
    it('should verify goal existence and call aiService', async () => {
      const apiKey = 'test-key'
      const generatedTasks = [mockTask]
      mockGoalsRepository.findById.mockResolvedValue(mockGoal)
      mockAiService.generateTasksForGoal.mockResolvedValue(generatedTasks)

      const result = await service.generateTasks('123', apiKey)

      expect(result).toEqual(generatedTasks)
      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
      expect(mockAiService.generateTasksForGoal).toHaveBeenCalledWith(mockGoal, apiKey)
    })

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalsRepository.findById.mockResolvedValue(null)

      await expect(service.generateTasks('123', 'test-key')).rejects.toThrow(NotFoundException)
      await expect(service.generateTasks('123', 'test-key')).rejects.toThrow('Objetivo 123 não encontrado')
    })
  })

  describe('regenerateTasks', () => {
    it('should delete existing tasks before generating new ones', async () => {
      const apiKey = 'test-key'
      const generatedTasks = [mockTask]
      mockGoalsRepository.findById.mockResolvedValue(mockGoal)
      mockTasksRepository.deleteByGoalId.mockResolvedValue(undefined)
      mockAiService.generateTasksForGoal.mockResolvedValue(generatedTasks)

      const result = await service.regenerateTasks('123', apiKey)

      expect(result).toEqual(generatedTasks)
      expect(mockGoalsRepository.findById).toHaveBeenCalledWith('123')
      expect(mockTasksRepository.deleteByGoalId).toHaveBeenCalledWith('123')
      expect(mockAiService.generateTasksForGoal).toHaveBeenCalledWith(mockGoal, apiKey)
    })

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalsRepository.findById.mockResolvedValue(null)

      await expect(service.regenerateTasks('123', 'test-key')).rejects.toThrow(NotFoundException)
      await expect(service.regenerateTasks('123', 'test-key')).rejects.toThrow('Objetivo 123 não encontrado')
    })
  })
})
