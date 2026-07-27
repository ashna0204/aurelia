import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// One MSW server for the whole suite. Tests append per-case overrides with
// `server.use(...)`; `setup.js` resets them after every test.
export const server = setupServer(...handlers)
