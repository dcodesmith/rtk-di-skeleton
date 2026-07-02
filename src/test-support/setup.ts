import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// React Testing Library auto-cleans up between tests (Vitest globals), so we
// only need to reset jsdom's localStorage here.
afterEach(() => {
  localStorage.clear()
})
