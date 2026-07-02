import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Container } from '../../../container'
import type { State } from '../..'
import { Cart as CartDomain } from '../../../domain/cart'
import type { ServerError } from '../../../services/cartApiService'

export const loadCart = createAsyncThunk<
  CartDomain.Cart,
  void,
  { state: State; extra: Container; rejectValue: CartDomain.Cart | undefined }
>(
  'cart/loadCart',
  async (_, { extra, rejectWithValue }) => {
    try {
      return await extra.loadCart()
    } catch (error) {
      // Surface the reconciled cart (if any) so slices can self-heal.
      return rejectWithValue((error as ServerError).cartFromServer)
    }
  },
  {
    // Thunk-level guard: only load from a fresh cart. Prevents duplicate loads
    // (e.g. React StrictMode double-invoking the bootstrap effect in dev).
    condition: (_, { getState }) =>
      getState().cart.status === CartDomain.INITIAL
  }
)
