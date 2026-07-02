import { createSlice } from '@reduxjs/toolkit'
import { Cart as CartDomain } from '../../domain/cart'
import { loadCart } from './thunks/loadCart'

const status = createSlice({
  name: 'cart/status',
  initialState: CartDomain.INITIAL as CartDomain.Status,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(loadCart.pending, () => CartDomain.LOADING)
    builder.addCase(loadCart.fulfilled, () => CartDomain.NOT_SUBMITTED)
    builder.addCase(loadCart.rejected, () => CartDomain.NOT_SUBMITTED)
  }
})

export const { reducer: statusReducer } = status
