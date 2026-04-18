// src/mocks/config.ts
import { supabase } from '@shared/config/supabase'
import { MOCK_PERSONS, type MockPerson } from './data/persons'
import { HttpResponse } from 'msw'

export async function getCurrentMockUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.email) {
    return MOCK_PERSONS.find(p => p.email === session.user!.email)?.id ?? null
  }
  // Dev mode fallback: read role from localStorage (DevModeLogin)
  try {
    const devRole = localStorage.getItem('nquoc-dev-role') || 'member'
    const person = MOCK_PERSONS.find(p => p.primary_role === devRole)
    return person?.id ?? MOCK_PERSONS[0].id
  } catch {
    return null
  }
}

export async function getCurrentMockPerson(): Promise<MockPerson | null> {
  const id = await getCurrentMockUserId()
  return id ? MOCK_PERSONS.find(p => p.id === id) ?? null : null
}

export const unauthorized = () => HttpResponse.json(
  { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' },
  { status: 401 },
)
export const forbidden = (msg = 'Forbidden') => HttpResponse.json(
  { statusCode: 403, message: msg, error: 'Forbidden' },
  { status: 403 },
)
export const notFound = (msg = 'Not found') => HttpResponse.json(
  { statusCode: 404, message: msg, error: 'Not Found' },
  { status: 404 },
)
export const badRequest = (errors: string[]) => HttpResponse.json(
  { statusCode: 400, message: errors, error: 'Bad Request' },
  { status: 400 },
)
