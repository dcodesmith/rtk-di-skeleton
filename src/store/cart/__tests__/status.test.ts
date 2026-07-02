import { describe, it, expect } from 'vitest'
import { statusReducer } from '../status'
import { loadCart } from '../thunks/loadCart'
import { INITIAL, LOADING, NOT_SUBMITTED } from '../../../domain/cart/Cart'
import { createCart } from '../../../test-support/factories'

describe('cart/status slice', () => {
  it('starts INITIAL', () => {
    expect(statusReducer(undefined, { type: '@@init' })).toBe(INITIAL)
  })

  it('moves to LOADING while the cart loads', () => {
    expect(statusReducer(INITIAL, loadCart.pending('req'))).toBe(LOADING)
  })

  it('settles to NOT_SUBMITTED on success', () => {
    expect(
      statusReducer(LOADING, loadCart.fulfilled(createCart(), 'req'))
    ).toBe(NOT_SUBMITTED)
  })

  it('settles to NOT_SUBMITTED even when the load is rejected (self-heal)', () => {
    expect(
      statusReducer(LOADING, loadCart.rejected(null, 'req', undefined))
    ).toBe(NOT_SUBMITTED)
  })
})
