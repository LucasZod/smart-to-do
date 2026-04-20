import { Test, TestingModule } from '@nestjs/testing'
import { AiService, parseTaskTitles } from './ai.service'
import { LlmProvider } from '../providers/llm.provider'
import { TasksRepository } from '../../tasks/providers/tasks.repository'
import { AiProviderException } from '../../../shared/exceptions/ai-provider.exception'
import { Goal } from '../../goals/entities/goal.entity'
import { Task } from '../../tasks/entities/task.entity'

describe('AiService', () => {
  let service: AiService

  const mockGoal: Goal = {
    id: '123',
    objective: 'PLAN A TRIP to Europe',
    tasks: [],
    createdAt: new Date()
  }

  const mockLlmProvider = {
    complete: jest.fn()
  }

  const mockTasksRepository = {
    saveMany: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: LlmProvider,
          useValue: mockLlmProvider
        },
        {
          provide: TasksRepository,
          useValue: mockTasksRepository
        }
      ]
    }).compile()

    service = module.get<AiService>(AiService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('parseTaskTitles', () => {
    it('should parse valid JSON array of strings', () => {
      const input = JSON.stringify(['Task 1', 'Task 2', 'Task 3'])
      const result = parseTaskTitles(input)

      expect(result).toEqual(['Task 1', 'Task 2', 'Task 3'])
    })

    it('should throw AiProviderException when JSON is not an array', () => {
      const input = JSON.stringify({ tasks: ['Task 1', 'Task 2'] })

      expect(() => parseTaskTitles(input)).toThrow(AiProviderException)
      expect(() => parseTaskTitles(input)).toThrow('Resposta da IA não é um array JSON válido')
    })

    it('should throw AiProviderException when JSON is invalid', () => {
      const input = 'not a valid json'

      expect(() => parseTaskTitles(input)).toThrow(AiProviderException)
      expect(() => parseTaskTitles(input)).toThrow('Resposta da IA não é um array JSON válido')
    })

    it('should return empty array when input is empty array', () => {
      const input = JSON.stringify([])
      const result = parseTaskTitles(input)

      expect(result).toEqual([])
    })

    it('should filter out non-string items from array', () => {
      const input = JSON.stringify(['Task 1', 123, 'Task 2', null, 'Task 3', true, { task: 'Task 4' }])
      const result = parseTaskTitles(input)

      expect(result).toEqual(['Task 1', 'Task 2', 'Task 3'])
    })
  })

  describe('generateTasksForGoal', () => {
    it('should generate and save tasks successfully', async () => {
      const apiKey = 'test-key'
      const rawResponse = JSON.stringify(['Book flights', 'Reserve hotel', 'Plan itinerary'])
      const savedTasks: Task[] = [
        {
          id: '1',
          title: 'Book flights',
          isCompleted: false,
          isAiGenerated: true,
          goalId: '123',
          goal: mockGoal,
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Reserve hotel',
          isCompleted: false,
          isAiGenerated: true,
          goalId: '123',
          goal: mockGoal,
          createdAt: new Date()
        },
        {
          id: '3',
          title: 'Plan itinerary',
          isCompleted: false,
          isAiGenerated: true,
          goalId: '123',
          goal: mockGoal,
          createdAt: new Date()
        }
      ]

      mockLlmProvider.complete.mockResolvedValue(rawResponse)
      mockTasksRepository.saveMany.mockResolvedValue(savedTasks)

      const result = await service.generateTasksForGoal(mockGoal, apiKey)

      expect(result).toEqual(savedTasks)
      expect(mockLlmProvider.complete).toHaveBeenCalledWith('PLAN A TRIP to Europe', apiKey)
      expect(mockTasksRepository.saveMany).toHaveBeenCalledWith([
        { title: 'Book flights', goalId: '123', isCompleted: false, isAiGenerated: true },
        { title: 'Reserve hotel', goalId: '123', isCompleted: false, isAiGenerated: true },
        { title: 'Plan itinerary', goalId: '123', isCompleted: false, isAiGenerated: true }
      ])
    })

    it('should throw AiProviderException when LLM returns invalid JSON', async () => {
      const apiKey = 'test-key'
      const rawResponse = 'invalid json response'

      mockLlmProvider.complete.mockResolvedValue(rawResponse)

      await expect(service.generateTasksForGoal(mockGoal, apiKey)).rejects.toThrow(AiProviderException)
      await expect(service.generateTasksForGoal(mockGoal, apiKey)).rejects.toThrow(
        'Resposta da IA não é um array JSON válido'
      )
    })

    it('should throw AiProviderException when LLM returns non-array JSON', async () => {
      const apiKey = 'test-key'
      const rawResponse = JSON.stringify({ message: 'Here are your tasks' })

      mockLlmProvider.complete.mockResolvedValue(rawResponse)

      await expect(service.generateTasksForGoal(mockGoal, apiKey)).rejects.toThrow(AiProviderException)
      await expect(service.generateTasksForGoal(mockGoal, apiKey)).rejects.toThrow(
        'Resposta da IA não é um array JSON válido'
      )
    })
  })
})
