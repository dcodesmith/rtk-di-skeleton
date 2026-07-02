import { describe, it, expect } from 'vitest'
import {
  create,
  isLoaded,
  hasItems,
  isEmpty,
  canCheckout,
  isCompleted,
  reconcileFromError,
  INITIAL,
  LOADING,
  NOT_SUBMITTED,
  COMPLETED,
  defaultTotals
} from './Cart'
import { createCart, createCartItem } from '../../test-support/factories'

describe('Cart domain', () => {
  describe('#create', () => {
    it('builds a fresh cart from stored fields with zeroed totals and INITIAL status', () => {
      const cart = create({ cartIdKey: 'srv_9', items: [createCartItem()] })

      expect(cart).toEqual({
        cartIdKey: 'srv_9',
        items: [createCartItem()],
        totals: defaultTotals,
        status: INITIAL
      })
    })
  })

  describe('#isLoaded', () => {
    it('is false while INITIAL or LOADING', () => {
      expect(isLoaded(INITIAL)).toBe(false)
      expect(isLoaded(LOADING)).toBe(false)
    })

    it('is true once past the loading states', () => {
      expect(isLoaded(NOT_SUBMITTED)).toBe(true)
      expect(isLoaded(COMPLETED)).toBe(true)
    })
  })

  describe('#hasItems', () => {
    it('reflects whether there is at least one item', () => {
      expect(hasItems(0)).toBe(false)
      expect(hasItems(3)).toBe(true)
    })
  })

  describe('#isEmpty', () => {
    it('is the inverse of hasItems', () => {
      expect(isEmpty(0)).toBe(true)
      expect(isEmpty(2)).toBe(false)
    })
  })

  describe('#isCompleted', () => {
    it('is true only for COMPLETED', () => {
      expect(isCompleted(COMPLETED)).toBe(true)
      expect(isCompleted(NOT_SUBMITTED)).toBe(false)
    })
  })

  describe('#canCheckout', () => {
    it('is true when loaded, non-empty and not completed', () => {
      expect(canCheckout(NOT_SUBMITTED, 2)).toBe(true)
    })

    it('is false while still loading', () => {
      expect(canCheckout(INITIAL, 2)).toBe(false)
      expect(canCheckout(LOADING, 2)).toBe(false)
    })

    it('is false with an empty cart', () => {
      expect(canCheckout(NOT_SUBMITTED, 0)).toBe(false)
    })

    it('is false once the order is completed', () => {
      expect(canCheckout(COMPLETED, 2)).toBe(false)
    })
  })

  describe('#reconcileFromError', () => {
    it('merges server truth over the local cart', () => {
      const local = createCart({ cartIdKey: 'local', items: [] })
      const fromError = {
        cartIdKey: 'srv_from_error',
        items: [createCartItem({ quantity: 5 })],
        totals: { subTotal: 90, tax: 9, grandTotal: 99 }
      }

      expect(reconcileFromError(local, fromError)).toEqual({
        ...local,
        ...fromError
      })
    })

    it('falls back to local items/totals when the error omits them', () => {
      const local = createCart()

      expect(reconcileFromError(local, { status: NOT_SUBMITTED })).toEqual({
        ...local,
        status: NOT_SUBMITTED
      })
    })
  })
})
