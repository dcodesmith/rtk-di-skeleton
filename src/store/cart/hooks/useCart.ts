import { useSelector } from 'react-redux'
import { useAction } from '../../useAction'
import { Cart as CartDomain } from '../../../domain/cart'
import {
  getTotals,
  getTotalsLoading,
  getTotalItems,
  getCartStatus
} from '../selectors'
import { loadCart } from '../thunks/loadCart'

/**
 * The ONLY interface components use to read cart summary state + load the cart.
 * Combines selectors + domain helpers + bound actions.
 */
export const useCart = () => {
  const totals = useSelector(getTotals)
  const isLoading = useSelector(getTotalsLoading)
  const totalItems = useSelector(getTotalItems)
  const status = useSelector(getCartStatus)

  return {
    subTotal: totals.subTotal,
    tax: totals.tax,
    grandTotal: totals.grandTotal,
    isLoading,
    totalItems,
    status,
    hasItems: CartDomain.hasItems(totalItems),
    isEmpty: CartDomain.isEmpty(totalItems),
    isCompleted: CartDomain.isCompleted(status),
    // Composed domain rule: derive one flag from status + item count instead of
    // scattering `isLoaded && hasItems && !isCompleted` across components.
    canCheckout: CartDomain.canCheckout(status, totalItems),
    loadCart: useAction(loadCart)
  }
}
