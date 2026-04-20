const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const buildUrl = (path: string, params?: Record<string, string>): string => {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  }
  return url.toString()
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) return undefined as T

  const data = await response.json().catch(() => ({ message: 'Invalid response from server' }))

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? `Request failed with status ${response.status}`)
  }

  return data as T
}

export const http = {
  get: <T>(path: string, options?: FetchOptions): Promise<T> =>
    fetch(buildUrl(path, options?.params), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      cache: 'no-store',
      ...options
    }).then((r) => parseResponse<T>(r)),

  post: <T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> =>
    fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }).then((r) => parseResponse<T>(r)),

  patch: <T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> =>
    fetch(buildUrl(path), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }).then((r) => parseResponse<T>(r)),

  delete: <T>(path: string, options?: FetchOptions): Promise<T> =>
    fetch(buildUrl(path), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options
    }).then((r) => parseResponse<T>(r))
}
