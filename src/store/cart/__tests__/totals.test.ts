import { describe, it, expect } from 'vitest'
import { totalsReducer, totalsInitialState } from '../totals'
import { loadCart } from '../thunks/loadCart'
import { updateCart } from '../thunks/updateCart'
import { realtimeMessageReceived } from '../../realtime'
import { Realtime as RealtimeDomain } from '../../../domain/realtime'
import { createCart } from '../../../test-support/factories'

describe('cart/totals slice', () => {
  const cart = createCart({
    totals: { subTotal: 50, tax: 5, grandTotal: 55 }
  })

  it('adopts server totals on loadCart.fulfilled', () => {
    const next = totalsReducer(
      totalsInitialState,
      loadCart.fulfilled(cart, 'req')
    )

    expect(next).toEqual({
      subTotal: 50,
      tax: 5,
      grandTotal: 55,
      loading: false
    })
  })

  it('marks loading on updateCart.pending and clears it on fulfilled', () => {
    const pending = totalsReducer(
      totalsInitialState,
      updateCart.pending('req', undefined)
    )
    expect(pending.loading).toBe(true)

    const fulfilled = totalsReducer(
      pending,
      updateCart.fulfilled(cart, 'req', undefined)
    )
    expect(fulfilled.loading).toBe(false)
    expect(fulfilled.grandTotal).toBe(55)
  })

  it('applies totals from a realtime cart push', () => {
    const next = totalsReducer(
      totalsInitialState,
      realtimeMessageReceived({ type: RealtimeDomain.CART_UPDATED, cart })
    )

    expect(next).toEqual({
      subTotal: 50,
      tax: 5,
      grandTotal: 55,
      loading: false
    })
  })
})
