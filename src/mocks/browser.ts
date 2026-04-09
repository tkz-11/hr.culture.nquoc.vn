import { setupWorker } from 'msw/browser'
import { retentionHandlers } from './handlers/retention.handlers'
import { passportHandlers } from './handlers/passport.handlers'
import { cultureHandlers } from './handlers/culture.handlers'

export const worker = setupWorker(
  ...retentionHandlers,
  ...passportHandlers,
  ...cultureHandlers
)
