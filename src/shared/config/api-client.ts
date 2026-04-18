import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string
const IS_MOCK = import.meta.env.VITE_ENABLE_MOCKING === 'true'

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
  ) {
    super(message)
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError'
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T | undefined> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // In mock mode, skip supabase token (MSW doesn't need it)
  if (!IS_MOCK) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) headers['Authorization'] = `Bearer ${token}`
    } catch {
      // supabase unavailable, continue without token
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined

  const json = await res.json()

  if (!res.ok) {
    const msg = Array.isArray(json.message)
      ? (json.message as string[]).join('; ')
      : (json.message ?? 'Unknown error')
    throw new ApiError(res.status, msg, json.code, json.details)
  }

  return (json as { data: T }).data
}

export const api = {
  get:    <T>(path: string)                      => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)      => request<T>('POST',   path, body),
  patch:  <T>(path: string, body?: unknown)      => request<T>('PATCH',  path, body),
  put:    <T>(path: string, body?: unknown)      => request<T>('PUT',    path, body),
  delete: <T>(path: string)                      => request<T>('DELETE', path),
}
