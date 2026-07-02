import { configureStore } from '@reduxjs/toolkit'
import { rootReducer, type State, type AppDispatch } from '../store'
import { thunkWithContainer } from '../store/middlewares'
import { catalogApi } from '../store/catalog/catalogApi'
import type { Container } from '../container'
import { asMock, type RecursivePartial } from './asMock'

type MakeTestStoreArgs = {
  /** Partial DI container — provide only the deps the thunk under test uses. */
  container?: RecursivePartial<Container>
  preloadedState?: RecursivePartial<State>
}

/**
 * A real store wired exactly like production (custom `thunkWithContainer` +
 * RTK Query middleware), but with the DI container swapped for a mock via the
 * middleware's `createContainer` seam. `app.isInitialized` is preloaded so the
 * container builds immediately. (Ports the reference app's `test/redux`
 * `createMockStore`, minus redux-mock-store — we assert on real state.)
 */
export const makeTestStore = ({
  container = {},
  preloadedState
}: MakeTestStoreArgs = {}) => {
  const mockContainer = asMock<Container>(container)

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      app: { isInitialized: true },
      ...preloadedState
    } as never,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: false })
        .prepend(thunkWithContainer({ createContainer: () => mockContainer }))
        .concat(catalogApi.middleware)
  })

  // The store's inferred dispatch isn't thunk-aware (built-in thunk disabled),
  // so surface our real `AppDispatch` — same reasoning as production.
  return store as typeof store & { dispatch: AppDispatch }
}

export type TestStore = ReturnType<typeof makeTestStore>
