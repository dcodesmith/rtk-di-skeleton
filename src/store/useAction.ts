import { useCallback } from 'react'
import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit'
import { useAppDispatch } from './hooks'
import type { State } from '.'
import type { Container } from '../container'

/** Anything our thunk-aware dispatch accepts: a plain action or a thunk. */
type Dispatchable =
  | UnknownAction
  | ThunkAction<unknown, State, Container, UnknownAction>

/**
 * Wraps an action/thunk creator so components get a stable, pre-bound
 * dispatcher. Domain hooks (useCart, useItems) expose these instead of raw
 * dispatch, keeping components decoupled from Redux plumbing.
 */
export const useAction = <A extends (...args: never[]) => Dispatchable>(
  action: A
) => {
  const dispatch = useAppDispatch()

  return useCallback(
    (...args: Parameters<A>) => dispatch(action(...args)),
    [dispatch, action]
  )
}
