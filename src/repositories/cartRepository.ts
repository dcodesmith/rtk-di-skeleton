import type { CartApiService, BrowserStorageService } from '../services'
import type { ServerError } from '../services/cartApiService'
import { Cart as CartDomain } from '../domain/cart'

/**
 * Persistence + API orchestration for the cart.
 *
 * Key pattern from the reference architecture: `runReconcilableAction`. On
 * success we persist the server cart. On failure, if the server included an
 * authoritative cart in the error, we merge + persist it before re-throwing so
 * the store can self-heal from the rejected thunk.
 */
type Dependencies = {
  cartApiService: CartApiService
  browserStorageService: BrowserStorageService
}

export type CartRepository = ReturnType<typeof CartRepositoryImpl>

const CART_STORAGE_KEY = 'cart'

export const CartRepositoryImpl = ({
  cartApiService,
  browserStorageService
}: Dependencies) => {
  const getStoredCart = (): CartDomain.StoredCart =>
    browserStorageService.get<CartDomain.StoredCart>(CART_STORAGE_KEY) ?? {
      cartIdKey: null,
      items: []
    }

  const extractStorable = ({
    cartIdKey,
    items
  }: CartDomain.Cart): CartDomain.StoredCart => ({ cartIdKey, items })

  const storeCart = (cart: CartDomain.Cart): CartDomain.Cart => {
    browserStorageService.set(CART_STORAGE_KEY, extractStorable(cart))
    return cart
  }

  const removeCart = (): void => browserStorageService.destroy(CART_STORAGE_KEY)

  const runReconcilableAction = async (
    cart: CartDomain.Cart,
    action: () => Promise<CartDomain.Cart>
  ): Promise<CartDomain.Cart> => {
    try {
      const updated = await action()
      return storeCart(updated)
    } catch (rawError) {
      const error = rawError as ServerError
      if (error.cartFromServer) {
        const reconciled = CartDomain.reconcileFromError(
          cart,
          error.cartFromServer
        )
        storeCart(reconciled)
        error.cartFromServer = reconciled
      }
      throw error
    }
  }

  /** Load cart: hydrate from storage, then ask the server for truth. */
  const getCart = (): Promise<CartDomain.Cart> => {
    const cart = CartDomain.create(getStoredCart())
    return runReconcilableAction(cart, () => cartApiService.getCart(cart))
  }

  /** Push the current cart, persist server-recomputed totals. */
  const updateCart = (cart: CartDomain.Cart): Promise<CartDomain.Cart> =>
    runReconcilableAction(cart, () => cartApiService.updateCart(cart))

  return { getCart, updateCart, storeCart, removeCart }
}
