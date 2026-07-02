import { describe, it, expect } from 'vitest'
import {
  createCartItemId,
  incrementQuantity,
  setQuantity,
  lineTotal,
  canDecrement,
  isFree
} from '../CartItem'
import { createCartItem } from '../../../test-support/factories'

describe('CartItem domain', () => {
  describe('#createCartItemId', () => {
    it('derives a stable id from the product id', () => {
      expect(createCartItemId('p42')).toBe('item_p42')
    })
  })

  describe('#incrementQuantity', () => {
    it('adds 1 by default without mutating the input', () => {
      const item = createCartItem({ quantity: 2 })
      const next = incrementQuantity(item)

      expect(next.quantity).toBe(3)
      expect(item.quantity).toBe(2)
    })

    it('adds an arbitrary amount', () => {
      expect(
        incrementQuantity(createCartItem({ quantity: 1 }), 4).quantity
      ).toBe(5)
    })
  })

  describe('#setQuantity', () => {
    it('sets the quantity', () => {
      expect(setQuantity(createCartItem(), 7).quantity).toBe(7)
    })

    it('clamps to a minimum of 1', () => {
      expect(setQuantity(createCartItem(), 0).quantity).toBe(1)
      expect(setQuantity(createCartItem(), -5).quantity).toBe(1)
    })
  })

  describe('#lineTotal', () => {
    it('multiplies price by quantity', () => {
      expect(lineTotal(createCartItem({ price: 12.5, quantity: 3 }))).toBe(37.5)
    })
  })

  describe('#canDecrement', () => {
    it('is false at the minimum quantity of 1', () => {
      expect(canDecrement(createCartItem({ quantity: 1 }))).toBe(false)
    })

    it('is true above 1', () => {
      expect(canDecrement(createCartItem({ quantity: 2 }))).toBe(true)
    })
  })

  describe('#isFree', () => {
    it('is true only for a zero price', () => {
      expect(isFree(createCartItem({ price: 0 }))).toBe(true)
      expect(isFree(createCartItem({ price: 5 }))).toBe(false)
    })
  })
})
