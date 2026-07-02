import { describe, it, expect } from 'vitest'
import {
  itemsReducer,
  initialItemsState,
  itemQuantityChanged,
  itemRemoved
} from './items'
import { addItem } from './thunks/addItem'
import { loadCart } from './thunks/loadCart'
import { realtimeMessageReceived } from '../realtime'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import { createCart, createCartItem } from '../../test-support/factories'

const stateWith = (...items: ReturnType<typeof createCartItem>[]) =>
  items.reduce(
    (state, item) => itemsReducer(state, addItem.fulfilled(item, 'req', item)),
    initialItemsState
  )

describe('cart/items slice', () => {
  describe('reducers', () => {
    it('itemQuantityChanged updates a line, clamping to >= 1', () => {
      const start = stateWith(createCartItem({ id: 'item_p1', quantity: 1 }))

      const raised = itemsReducer(
        start,
        itemQuantityChanged({ id: 'item_p1', quantity: 4 })
      )
      expect(raised.entities.item_p1.quantity).toBe(4)

      const clamped = itemsReducer(
        start,
        itemQuantityChanged({ id: 'item_p1', quantity: 0 })
      )
      expect(clamped.entities.item_p1.quantity).toBe(1)
    })

    it('itemRemoved removes a line', () => {
      const start = stateWith(createCartItem({ id: 'item_p1' }))

      expect(itemsReducer(start, itemRemoved('item_p1')).ids).toEqual([])
    })
  })

  describe('extraReducers', () => {
    it('addItem.fulfilled upserts the returned line', () => {
      const item = createCartItem({ id: 'item_p1' })
      const next = itemsReducer(
        initialItemsState,
        addItem.fulfilled(item, 'req', createCartItem())
      )

      expect(next.entities.item_p1).toEqual(item)
    })

    it('loadCart.fulfilled replaces all items with the server list', () => {
      const start = stateWith(createCartItem({ id: 'stale' }))
      const cart = createCart({ items: [createCartItem({ id: 'item_p9' })] })

      const next = itemsReducer(start, loadCart.fulfilled(cart, 'req'))

      expect(next.ids).toEqual(['item_p9'])
    })

    it('realtime cartUpdated push replaces all items', () => {
      const start = stateWith(createCartItem({ id: 'old' }))
      const cart = createCart({ items: [createCartItem({ id: 'pushed' })] })

      const next = itemsReducer(
        start,
        realtimeMessageReceived({ type: RealtimeDomain.CART_UPDATED, cart })
      )

      expect(next.ids).toEqual(['pushed'])
    })

    it('ignores realtime events that are not cart updates', () => {
      const start = stateWith(createCartItem({ id: 'keep' }))

      const next = itemsReducer(
        start,
        realtimeMessageReceived({
          type: RealtimeDomain.PRICE_CHANGED,
          productId: 'p1',
          price: 20
        })
      )

      expect(next.ids).toEqual(['keep'])
    })
  })
})
