import { describe, it, expect } from 'vitest'
import { parse, serialize, CART_UPDATED, PRICE_CHANGED } from '../RealtimeEvent'
import { createCart } from '../../../test-support/factories'

describe('RealtimeEvent domain', () => {
  describe('#parse', () => {
    it('parses a known cartUpdated frame', () => {
      const cart = createCart()
      const raw = JSON.stringify({ type: CART_UPDATED, cart })

      expect(parse(raw)).toEqual({ type: CART_UPDATED, cart })
    })

    it('parses a known priceChanged frame', () => {
      const raw = JSON.stringify({
        type: PRICE_CHANGED,
        productId: 'p1',
        price: 20
      })

      expect(parse(raw)).toEqual({
        type: PRICE_CHANGED,
        productId: 'p1',
        price: 20
      })
    })

    it('returns null for an unknown event type', () => {
      expect(parse(JSON.stringify({ type: 'somethingElse' }))).toBeNull()
    })

    it('returns null for malformed JSON', () => {
      expect(parse('not json')).toBeNull()
    })
  })

  describe('#serialize', () => {
    it('round-trips through parse', () => {
      const event = { type: PRICE_CHANGED, productId: 'p2', price: 5 } as const
      expect(parse(serialize(event))).toEqual(event)
    })
  })
})
