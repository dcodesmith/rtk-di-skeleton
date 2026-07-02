import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import type { State, AppDispatch } from '.'
import { addItem } from './cart/thunks/addItem'
import { updateCart } from './cart/thunks/updateCart'
import { itemQuantityChanged, itemRemoved } from './cart/items'

/**
 * Reactive side effects, the RTK-recommended way (createListenerMiddleware)
 * instead of a hand-rolled middleware.
 *
 * Rule: whenever the set of cart items changes, re-sync with the server so it
 * recomputes totals + tax. Debounced via `cancelActiveListeners` + `delay`
 * (the canonical listener-middleware debounce), so rapid quantity taps collapse
 * into a single updateCart.
 */
export const listenerMiddleware = createListenerMiddleware()

// Pre-typed listener registrar (the skill's recommended `.withTypes` form).
const startAppListening = listenerMiddleware.startListening.withTypes<
  State,
  AppDispatch
>()

startAppListening({
  matcher: isAnyOf(addItem.fulfilled, itemQuantityChanged, itemRemoved),
  effect: async (_action, api) => {
    // Debounce: cancel any earlier pending sync, wait, then dispatch once.
    api.cancelActiveListeners()
    await api.delay(300)
    api.dispatch(updateCart())
  }
})
