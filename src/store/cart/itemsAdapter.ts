import { createEntityAdapter } from '@reduxjs/toolkit'
import type { CartItem } from '../../domain/cart/CartItem'

/**
 * The entity adapter lives in its own leaf module so both the `items` slice and
 * the selectors can import it without creating an import cycle
 * (items → thunks → selectors → items).
 */
export const itemsAdapter = createEntityAdapter<CartItem>()

export const initialItemsState = itemsAdapter.getInitialState()
