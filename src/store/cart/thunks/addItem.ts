import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Container } from '../../../container'
import type { State } from '../..'
import type { CartItem } from '../../../domain/cart/CartItem'
import type { Product } from '../../../domain/catalog/Product'
import { getAllItems } from '../selectors'
import { getConfig } from '../../config'

/**
 * Thin thunk: read state via selectors, delegate the real work to the
 * `addItem` use case (injected as `extra`), and let the slice's extraReducers
 * fold the result into state. Container arrives via the custom
 * `thunkWithContainer` middleware.
 */
export const addItem = createAsyncThunk<
  CartItem,
  Product,
  { state: State; extra: Container; rejectValue: string }
>('cart/items/addItem', (product, { getState, extra, rejectWithValue }) => {
  const state = getState()
  const allItems = getAllItems(state)
  const { maxItems } = getConfig(state)

  try {
    return extra.addItem(product, allItems, maxItems)
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})
