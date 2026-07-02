import { describe, it, expect } from 'vitest'
import { AddItemImpl, type AddItem } from './addItem'
import { MaxItemsReachedError } from '../../domain/errors'
import { createProduct, createCartItem } from '../../test-support/factories'

describe('AddItemImpl', () => {
  let addItem: AddItem

  beforeEach(() => {
    addItem = AddItemImpl({})
  })

  it('creates a new cart line for a product not yet in the cart', () => {
    const product = createProduct({ id: 'p2', name: 'Mug', price: 12.5 })

    expect(addItem(product, [], 20)).toEqual({
      id: 'item_p2',
      productId: 'p2',
      name: 'Mug',
      price: 12.5,
      quantity: 1
    })
  })

  it('increments quantity when the product is already in the cart', () => {
    const existing = createCartItem({ productId: 'p1', quantity: 2 })
    const product = createProduct({ id: 'p1' })

    expect(addItem(product, [existing], 20).quantity).toBe(3)
  })

  it('throws MaxItemsReachedError when the cart is full', () => {
    const items = [createCartItem({ id: 'a' }), createCartItem({ id: 'b' })]

    expect(() => addItem(createProduct(), items, 2)).toThrow(
      MaxItemsReachedError
    )
  })
})
