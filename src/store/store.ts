import { configureStore, type Reducer } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import { thunkWithContainer, socketMiddleware } from './middlewares'
import { listenerMiddleware } from './listenerMiddleware'
import { catalogApi } from './catalog/catalogApi'

/**
 * Store factory. Middleware wiring:
 *  - built-in thunk DISABLED (`thunk: false`)
 *  - `thunkWithContainer` replaces it (prepended, runs first) and also executes
 *    RTK Query's internal thunks (it handles any function action)
 *  - `socketMiddleware` owns the WebSocket connection lifecycle (realtime)
 *  - `listenerMiddleware` for reactive side effects (debounced cart sync)
 *  - `catalogApi.middleware` for RTK Query caching/invalidation
 *  - redux-logger appended in dev only
 */
export const configure =
  <R extends Reducer>(rootReducer: R) =>
  (preloadedState?: Partial<ReturnType<R>>) =>
    configureStore({
      reducer: rootReducer,
      preloadedState: preloadedState as never,
      middleware: getDefaultMiddleware => {
        const middlewares = getDefaultMiddleware({ thunk: false })
          .prepend(socketMiddleware())
          .prepend(listenerMiddleware.middleware)
          .prepend(thunkWithContainer())
          .concat(catalogApi.middleware)

        return import.meta.env.DEV ? middlewares.concat(logger) : middlewares
      },
      devTools: { name: 'RTK DI Skeleton' }
    })
