import { describe, it, expect } from 'vitest'
import { loadCart } from '../thunks/loadCart'
import {
  getAllItems,
  getTotalItems,
  getCartEntity,
  getCartStatus
} from '../selectors'
import { makeTestStore } from '../../../test-support/store'
import { createCart, createCartItem } from '../../../test-support/factories'
import { NOT_SUBMITTED } from '../../../domain/cart/Cart'

describe('cart selectors', () => {
  const cart = createCart({
    cartIdKey: 'srv_1',
    items: [
      createCartItem({ id: 'item_p1', quantity: 2 }),
      createCartItem({ id: 'item_p2', productId: 'p2' })
    ],
    totals: { subTotal: 54, tax: 5.4, grandTotal: 59.4 }
  })

  const seededStore = () => {
    const store = makeTestStore()
    // A plain (non-thunk) action flows straight through to the reducers.
    store.dispatch(loadCart.fulfilled(cart, 'req'))
    return store
  }

  it('getAllItems returns the normalized items as an array', () => {
    expect(getAllItems(seededStore().getState())).toEqual(cart.items)
  })

  it('getTotalItems counts the lines', () => {
    expect(getTotalItems(seededStore().getState())).toBe(2)
  })

  it('getCartStatus reflects the loaded status', () => {
    expect(getCartStatus(seededStore().getState())).toBe(NOT_SUBMITTED)
  })

  it('getCartEntity rebuilds the denormalized Cart from the sub-slices', () => {
    expect(getCartEntity(seededStore().getState())).toEqual({
      status: NOT_SUBMITTED,
      cartIdKey: 'srv_1',
      items: cart.items,
      totals: { subTotal: 54, tax: 5.4, grandTotal: 59.4 }
    })
  })
})
