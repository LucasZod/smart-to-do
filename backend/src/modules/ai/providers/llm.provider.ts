import { Injectable, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { AiProviderException } from '../../../shared/exceptions/ai-provider.exception'
import { OPENROUTER_URL, OPENROUTER_MODELS, AI_CONFIG } from '../constants/ai.constants'

@Injectable()
export class LlmProvider {
  constructor(private readonly httpService: HttpService) { }

  async complete(objective: string, apiKey: string): Promise<string> {
    const modelPromises = OPENROUTER_MODELS.map((model) => this.completeWithModel(objective, apiKey, model))

    try {
      return await Promise.any(modelPromises)
    } catch (error) {
      throw mapProviderError(error)
    }
  }

  private async completeWithModel(objective: string, apiKey: string, model: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(OPENROUTER_URL, buildPayload(objective, model), {
          headers: buildHeaders(apiKey),
          timeout: AI_CONFIG.REQUEST_TIMEOUT
        })
      )
      return extractContent(response.data)
    } catch (error) {
      throw mapProviderError(error)
    }
  }
}

const buildPayload = (objective: string, model: string) => ({
  model,
  messages: [
    {
      role: 'system',
      content: `Você é um assistente de planejamento de tarefas. Dado um objetivo, 
      retorne APENAS um array JSON válido de strings. Cada string é uma subtarefa curta e acionável. 
      Sem explicação. Sem markdown. Sem texto extra. (Resposnda em pt-BR)`.trim()
    },
    {
      role: 'user',
      content: `Objetivo: "${objective}"\n\nResponda apenas com o array JSON.`
    }
  ]
})

const buildHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
})

const extractContent = (data: unknown): string => {
  const response = data as { choices?: { message?: { content?: string } }[] }
  const content = response?.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new AiProviderException('Resposta da IA está vazia ou mal formatada', HttpStatus.UNPROCESSABLE_ENTITY)
  }

  return content
}

const mapProviderError = (error: unknown): AiProviderException => {
  if (error instanceof AggregateError) {
    const errors = error.errors as unknown[]
    if (errors.every((err) => err instanceof AiProviderException)) {
      return new AiProviderException(
        'Todos os modelos falharam ao gerar tarefas. Tente novamente mais tarde.',
        HttpStatus.SERVICE_UNAVAILABLE
      )
    }
  }

  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED')
      return new AiProviderException('Tempo limite do provedor de IA excedido', HttpStatus.SERVICE_UNAVAILABLE)
    if (error.response?.status === 401) return new AiProviderException('Chave da API inválida', HttpStatus.UNAUTHORIZED)
    if (error.response?.status === 429)
      return new AiProviderException(
        'Limite de requisições atingido. Tente novamente mais tarde.',
        HttpStatus.TOO_MANY_REQUESTS
      )
  }
  return new AiProviderException('Provedor de IA indisponível', HttpStatus.SERVICE_UNAVAILABLE)
}
