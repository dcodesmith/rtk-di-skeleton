import { useDispatch, useSelector } from 'react-redux'
import type { State, AppDispatch } from '.'

/**
 * Pre-typed hooks using react-redux 9's `.withTypes` helper (the current
 * recommended pattern). `useAppDispatch` is thunk-aware via our custom
 * `AppDispatch`, so no casts are needed when dispatching thunks.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<State>()
