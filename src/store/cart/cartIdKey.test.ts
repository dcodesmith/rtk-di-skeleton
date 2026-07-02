import { describe, it, expect } from 'vitest'
import { cartIdKeyReducer } from './cartIdKey'
import { loadCart } from './thunks/loadCart'
import { updateCart } from './thunks/updateCart'
import { realtimeMessageReceived } from '../realtime'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import { createCart } from '../../test-support/factories'

describe('cart/cartIdKey slice', () => {
  it('starts null', () => {
    expect(cartIdKeyReducer(undefined, { type: '@@init' })).toBeNull()
  })

  it('takes the server cart id from loadCart.fulfilled', () => {
    const next = cartIdKeyReducer(
      null,
      loadCart.fulfilled(createCart({ cartIdKey: 'srv_1' }), 'req')
    )
    expect(next).toBe('srv_1')
  })

  it('keeps the existing id when the payload has none', () => {
    const next = cartIdKeyReducer(
      'srv_keep',
      updateCart.fulfilled(createCart({ cartIdKey: null }), 'req', undefined)
    )
    expect(next).toBe('srv_keep')
  })

  it('adopts the id from a realtime cart push', () => {
    const next = cartIdKeyReducer(
      null,
      realtimeMessageReceived({
        type: RealtimeDomain.CART_UPDATED,
        cart: createCart({ cartIdKey: 'srv_pushed' })
      })
    )
    expect(next).toBe('srv_pushed')
  })
})
