import { createSlice } from '@reduxjs/toolkit'
import { loadCart } from './thunks/loadCart'
import { updateCart } from './thunks/updateCart'
import { realtimeMessageReceived } from '../realtime'
import { Realtime as RealtimeDomain } from '../../domain/realtime'

const initialState: string | null = null

const cartIdKey = createSlice({
  name: 'cart/cartIdKey',
  initialState: initialState as string | null,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      loadCart.fulfilled,
      (state, action) => action.payload.cartIdKey ?? state
    )
    builder.addCase(
      updateCart.fulfilled,
      (state, action) => action.payload.cartIdKey ?? state
    )
    builder.addCase(realtimeMessageReceived, (state, action) =>
      action.payload.type === RealtimeDomain.CART_UPDATED
        ? (action.payload.cart.cartIdKey ?? state)
        : state
    )
  }
})

export const { reducer: cartIdKeyReducer } = cartIdKey
