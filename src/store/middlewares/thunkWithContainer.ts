import type { Middleware } from '@reduxjs/toolkit'
import { makeContainer, type Container } from '../../container'
import { getIsInitialized } from '../app'
import { getConfig } from '../config'

/**
 * Custom replacement for the default redux-thunk middleware.
 *
 * Two jobs:
 *  1. Lazily build the DI container once the app is initialized (so it can read
 *     runtime config out of the store).
 *  2. When a dispatched action is a function (a thunk), invoke it with
 *     `(dispatch, getState, container)` — injecting the container as the thunk
 *     `extra` argument. This is why every thunk gets typed `extra: Container`.
 */
export const thunkWithContainer = ({
  createContainer = makeContainer
}: {
  createContainer?: typeof makeContainer
} = {}): Middleware => {
  let container: Container | undefined

  return store => next => (action: unknown) => {
    const state = store.getState()

    if (getIsInitialized(state) && !container) {
      container = createContainer({ config: getConfig(state) })
    }

    if (typeof action === 'function') {
      return action(store.dispatch, store.getState, container)
    }

    return next(action)
  }
}
