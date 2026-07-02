import {
  createSlice,
  type EntityState,
  type PayloadAction
} from '@reduxjs/toolkit'
import type { CartItem } from '../../domain/cart/CartItem'
import type { Cart as CartDomain } from '../../domain/cart'
import { itemsAdapter, initialItemsState } from './itemsAdapter'
import { addItem } from './thunks/addItem'
import { loadCart } from './thunks/loadCart'
import { updateCart } from './thunks/updateCart'
import { realtimeMessageReceived } from '../realtime'
import { Realtime as RealtimeDomain } from '../../domain/realtime'

export { itemsAdapter, initialItemsState }

/** Replace all items with the server's authoritative list. */
const setAllFromCart = (
  state: EntityState<CartItem, string>,
  cart: CartDomain.Cart | undefined
) => {
  if (cart?.items) itemsAdapter.setAll(state, cart.items)
}

const items = createSlice({
  name: 'cart/items',
  initialState: initialItemsState,
  reducers: {
    // Event-style actions ("something happened"), not generic setters. The
    // reducer owns the state transition; the listener middleware watches these
    // to trigger a debounced server re-sync.
    itemQuantityChanged: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) =>
      itemsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: { quantity: Math.max(1, action.payload.quantity) }
      }),
    itemRemoved: itemsAdapter.removeOne
  },
  extraReducers: builder => {
    builder.addCase(addItem.fulfilled, itemsAdapter.upsertOne)
    builder.addCase(loadCart.fulfilled, (state, action) =>
      setAllFromCart(state, action.payload)
    )
    // Self-heal: if the server rejected but returned truth, apply it.
    builder.addCase(
      loadCart.rejected,
      (state, action: PayloadAction<CartDomain.Cart | undefined>) =>
        setAllFromCart(state, action.payload)
    )
    builder.addCase(
      updateCart.rejected,
      (state, action: PayloadAction<CartDomain.Cart | undefined>) =>
        setAllFromCart(state, action.payload)
    )
    // Realtime: the server pushed an authoritative cart over the socket.
    builder.addCase(realtimeMessageReceived, (state, action) => {
      if (action.payload.type === RealtimeDomain.CART_UPDATED) {
        setAllFromCart(state, action.payload.cart)
      }
    })
  }
})

export const {
  reducer: itemsReducer,
  actions: { itemQuantityChanged, itemRemoved }
} = items
