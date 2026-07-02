import { describe, it, expect, vi } from 'vitest'
import { addItem } from './thunks/addItem'
import { AddItemImpl } from '../../use-cases/cart/addItem'
import { MaxItemsReachedError } from '../../domain/errors'
import { getAllItems } from './selectors'
import { makeTestStore } from '../../test-support/store'
import { createConfig, createProduct } from '../../test-support/factories'

describe('addItem thunk (through the store + DI container)', () => {
  it('delegates to the injected use case and folds the item into state', async () => {
    const store = makeTestStore({
      // Use the real use case as the injected dependency.
      container: { addItem: AddItemImpl({}) }
    })

    const action = await store.dispatch(addItem(createProduct({ id: 'p1' })))

    expect(addItem.fulfilled.match(action)).toBe(true)
    expect(getAllItems(store.getState())).toEqual([
      expect.objectContaining({ productId: 'p1', quantity: 1 })
    ])
  })

  it('increments quantity when adding a product already in the cart', async () => {
    const store = makeTestStore({ container: { addItem: AddItemImpl({}) } })
    const product = createProduct({ id: 'p1' })

    await store.dispatch(addItem(product))
    await store.dispatch(addItem(product))

    expect(getAllItems(store.getState())[0].quantity).toBe(2)
  })

  it('rejects (without mutating state) when the max-items rule is violated', async () => {
    const store = makeTestStore({
      container: { addItem: AddItemImpl({}) },
      preloadedState: { config: createConfig({ maxItems: 0 }) }
    })

    const action = await store.dispatch(addItem(createProduct()))

    expect(addItem.rejected.match(action)).toBe(true)
    expect(action.payload).toBe(new MaxItemsReachedError().message)
    expect(getAllItems(store.getState())).toEqual([])
  })

  it('passes the container through as the thunk extra argument', async () => {
    const addItemSpy = vi.fn(AddItemImpl({}))
    const store = makeTestStore({ container: { addItem: addItemSpy } })

    await store.dispatch(addItem(createProduct({ id: 'p1' })))

    expect(addItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1' }),
      [],
      expect.any(Number)
    )
  })
})
