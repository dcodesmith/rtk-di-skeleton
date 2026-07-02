import { combineReducers } from '@reduxjs/toolkit'
import { itemsReducer } from './items'
import { totalsReducer } from './totals'
import { statusReducer } from './status'
import { cartIdKeyReducer } from './cartIdKey'

/**
 * The cart is composed of small, focused sub-slices rather than one giant
 * reducer. Each async result can fan out across several of them.
 */
export const cartReducer = combineReducers({
  items: itemsReducer,
  totals: totalsReducer,
  status: statusReducer,
  cartIdKey: cartIdKeyReducer
})
