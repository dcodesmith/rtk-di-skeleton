import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Container } from '../../../container'
import type { State } from '../..'
import type { Cart as CartDomain } from '../../../domain/cart'
import type { ServerError } from '../../../services/cartApiService'
import { getCartEntity } from '../selectors'

/**
 * Re-syncs the whole cart with the server. Triggered automatically by the
 * `cartListener` middleware whenever items change (debounced), so the UI never
 * has to remember to recalculate totals/tax.
 */
export const updateCart = createAsyncThunk<
  CartDomain.Cart,
  void,
  { state: State; extra: Container; rejectValue: CartDomain.Cart | undefined }
>('cart/update', async (_, { getState, extra, rejectWithValue }) => {
  const cart = getCartEntity(getState())

  try {
    return await extra.updateCart(cart)
  } catch (error) {
    return rejectWithValue((error as ServerError).cartFromServer)
  }
})
