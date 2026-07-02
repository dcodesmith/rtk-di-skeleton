import { describe, it, expect } from 'vitest'
import {
  toCartItem,
  refersToSameItem,
  quantityInCart,
  isInCart
} from './Product'
import { createProduct, createCartItem } from '../../test-support/factories'

describe('Product domain', () => {
  describe('#toCartItem', () => {
    it('maps a product to a cart line with quantity 1 by default', () => {
      const product = createProduct({ id: 'p7', name: 'Kettle', price: 42 })

      expect(toCartItem(product)).toEqual({
        id: 'item_p7',
        productId: 'p7',
        name: 'Kettle',
        price: 42,
        quantity: 1
      })
    })

    it('honors an explicit quantity', () => {
      expect(toCartItem(createProduct(), 3).quantity).toBe(3)
    })
  })

  describe('#refersToSameItem', () => {
    it('matches when the cart line came from the product', () => {
      const product = createProduct({ id: 'p1' })
      expect(
        refersToSameItem(product, createCartItem({ productId: 'p1' }))
      ).toBe(true)
    })

    it('does not match a different product', () => {
      expect(
        refersToSameItem(
          createProduct({ id: 'p1' }),
          createCartItem({ productId: 'p2' })
        )
      ).toBe(false)
    })
  })

  describe('#quantityInCart', () => {
    it('returns the matching line quantity', () => {
      const product = createProduct({ id: 'p1' })
      const items = [
        createCartItem({ productId: 'p2', quantity: 9 }),
        createCartItem({ productId: 'p1', quantity: 3 })
      ]

      expect(quantityInCart(product, items)).toBe(3)
    })

    it('returns 0 when the product is not in the cart', () => {
      expect(quantityInCart(createProduct({ id: 'p1' }), [])).toBe(0)
    })
  })

  describe('#isInCart', () => {
    it('is true only when a matching line exists', () => {
      const product = createProduct({ id: 'p1' })

      expect(isInCart(product, [createCartItem({ productId: 'p1' })])).toBe(
        true
      )
      expect(isInCart(product, [createCartItem({ productId: 'p2' })])).toBe(
        false
      )
    })
  })
})
