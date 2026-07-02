import {
  combineSlices,
  type ThunkDispatch,
  type UnknownAction
} from '@reduxjs/toolkit'
import { configure } from './store'
import { appSlice } from './app'
import { configSlice } from './config'
import { cartReducer } from './cart'
import { realtimeSlice } from './realtime'
import { catalogApi } from './catalog/catalogApi'
import type { Container } from '../container'

/**
 * `combineSlices` (RTK 2) composes slices by their `reducerPath`/`name` and
 * also accepts plain reducer maps. It supports lazy reducer injection via
 * `rootReducer.inject(slice)` for code-splitting — we compose everything
 * eagerly here, but the door is open.
 */
export const rootReducer = combineSlices(appSlice, configSlice, realtimeSlice, {
  cart: cartReducer,
  catalogApi: catalogApi.reducer
})

export type State = ReturnType<typeof rootReducer>

export const makeStore = () => configure(rootReducer)()

export type AppStore = ReturnType<typeof makeStore>

/**
 * We disabled the built-in thunk and replaced it with `thunkWithContainer`,
 * so the store's inferred dispatch type does NOT know about thunks. We declare
 * `AppDispatch` manually to reflect runtime reality: our middleware accepts
 * thunks and injects the DI `Container` as the `extra` argument.
 */
export type AppDispatch = ThunkDispatch<State, Container, UnknownAction>
