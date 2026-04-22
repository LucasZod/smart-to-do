export const AI_CONFIG = {
  REQUEST_TIMEOUT: 15_000,
  MAX_TASKS: 20,
  MIN_TASKS: 1,
  MAX_TASK_TITLE_LENGTH: 255,
  MIN_TASK_TITLE_LENGTH: 3
} as const

export const OPENROUTER_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'z-ai/glm-4.5-air:free',
  'openai/gpt-oss-120b:free'
] as const

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions' as const
