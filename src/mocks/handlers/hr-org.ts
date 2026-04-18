// src/mocks/handlers/hr-org.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, unauthorized } from '../config'
import { MOCK_ORG_UNITS } from '../data/hr-org'

export const hrOrgHandlers = [
  http.get('*/api/hr/org-structure', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_ORG_UNITS })
  }),
]
