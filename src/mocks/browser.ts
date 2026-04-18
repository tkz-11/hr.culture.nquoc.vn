// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { authHandlers }        from './handlers/auth'
import { hrOrgHandlers }       from './handlers/hr-org'
import { hrRetentionHandlers } from './handlers/hr-retention'
import { hrPassportHandlers }  from './handlers/hr-passport'
import { hrCultureHandlers }   from './handlers/hr-culture'

export const worker = setupWorker(
  ...authHandlers,
  ...hrOrgHandlers,
  ...hrRetentionHandlers,
  ...hrPassportHandlers,
  ...hrCultureHandlers,
)
