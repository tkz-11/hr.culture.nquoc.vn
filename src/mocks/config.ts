// src/mocks/config.ts
import { MOCK_PERSONS, type MockPerson } from './data/persons'
import { HttpResponse } from 'msw'

export function getCurrentMockUserId(): string | null {
  try {
    const devRole = localStorage.getItem('nquoc-dev-role') || 'member'
    const person = MOCK_PERSONS.find(p => p.primary_role === devRole)
    return person?.id ?? MOCK_PERSONS[0].id
  } catch {
    return null
  }
}

export function getCurrentMockPerson(): MockPerson | null {
  const id = getCurrentMockUserId()
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
