import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeTestStore, type TestStore } from './store'
import type { RecursivePartial } from './asMock'
import type { Container } from '../container'
import type { State } from '../store'

type RenderWithStoreOptions = Omit<RenderOptions, 'wrapper' | 'container'> & {
  store?: TestStore
  container?: RecursivePartial<Container>
  preloadedState?: RecursivePartial<State>
}

/**
 * Render a component inside a real (mock-container) Redux store — the component
 * counterpart to `makeTestStore`. Returns the store so tests can drive/assert
 * state. For components that also need router context, use `createRoutesStub`
 * (see the routing tests).
 */
export const renderWithStore = (
  ui: ReactElement,
  { store, container, preloadedState, ...options }: RenderWithStoreOptions = {}
) => {
  const testStore = store ?? makeTestStore({ container, preloadedState })

  return {
    store: testStore,
    ...render(<Provider store={testStore}>{ui}</Provider>, options)
  }
}
