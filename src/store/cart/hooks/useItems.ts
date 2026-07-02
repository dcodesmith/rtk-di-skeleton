import { useSelector } from 'react-redux'
import { useAction } from '../../useAction'
import { getAllItems, getTotalItems } from '../selectors'
import { addItem } from '../thunks/addItem'
import { itemQuantityChanged, itemRemoved } from '../items'

/**
 * Line-item interface for components: read items, add via thunk, and emit
 * event-style mutations. Mutations trigger a debounced server re-sync via the
 * listener middleware.
 */
export const useItems = () => ({
  items: useSelector(getAllItems),
  totalItems: useSelector(getTotalItems),
  addItem: useAction(addItem),
  changeQuantity: useAction(itemQuantityChanged),
  removeItem: useAction(itemRemoved)
})
