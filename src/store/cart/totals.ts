import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Cart as CartDomain } from '../../domain/cart'
import { loadCart } from './thunks/loadCart'
import { updateCart } from './thunks/updateCart'
import { realtimeMessageReceived } from '../realtime'
import { Realtime as RealtimeDomain } from '../../domain/realtime'

export type TotalsState = CartDomain.Totals & { loading: boolean }

export const totalsInitialState: TotalsState = {
  loading: false,
  ...CartDomain.defaultTotals
}

const fromCart = (
  state: TotalsState,
  action: PayloadAction<CartDomain.Cart | undefined>
): TotalsState =>
  action.payload
    ? { ...state, ...action.payload.totals, loading: false }
    : { ...state, loading: false }

const totals = createSlice({
  name: 'cart/totals',
  initialState: totalsInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(loadCart.fulfilled, fromCart)
    builder.addCase(loadCart.rejected, fromCart)

    builder.addCase(updateCart.pending, state => {
      state.loading = true
    })
    builder.addCase(updateCart.fulfilled, fromCart)
    builder.addCase(updateCart.rejected, fromCart)

    builder.addCase(realtimeMessageReceived, (state, action) => {
      if (action.payload.type === RealtimeDomain.CART_UPDATED) {
        return { ...state, ...action.payload.cart.totals, loading: false }
      }
      return state
    })
  }
})

export const { reducer: totalsReducer } = totals
