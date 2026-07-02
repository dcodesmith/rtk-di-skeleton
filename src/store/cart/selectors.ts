import { createSelector } from '@reduxjs/toolkit'
import type { State } from '..'
import type { Cart as CartDomain } from '../../domain/cart'
import { itemsAdapter } from './itemsAdapter'

// root
export const getCart = (state: State) => state.cart

// items (normalized) — use the entity adapter's built-in memoized selectors,
// projected onto the global state via an input selector.
const itemsSelectors = itemsAdapter.getSelectors(
  (state: State) => getCart(state).items
)
export const getAllItems = itemsSelectors.selectAll
export const getTotalItems = itemsSelectors.selectTotal
export const getItem = (state: State, id: string) =>
  itemsSelectors.selectById(state, id)

// totals
export const getTotals = (state: State) => getCart(state).totals
export const getTotalsLoading = (state: State) => getCart(state).totals.loading

// status + id
export const getCartStatus = (state: State) => getCart(state).status
export const getCartIdKey = (state: State) => getCart(state).cartIdKey

/**
 * Rebuild the denormalized `Cart` domain object from the sub-slices. Thunks
 * (updateCart) send this shape to the repository/API.
 */
export const getCartEntity = createSelector(
  [getCartStatus, getAllItems, getTotals, getCartIdKey],
  (status, items, totals, cartIdKey): CartDomain.Cart => ({
    status,
    items,
    cartIdKey,
    totals: {
      subTotal: totals.subTotal,
      tax: totals.tax,
      grandTotal: totals.grandTotal
    }
  })
)
