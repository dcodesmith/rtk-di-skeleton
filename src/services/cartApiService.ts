import type { Config } from '../domain/Config'
import type { Cart as CartDomain } from '../domain/cart'

/**
 * Cart CRUD "server". In a real app the methods below would call
 * `requestService.post(`${config.cartApiBaseUrl}/carts`, cart)`; here they
 * simulate a backend that recomputes authoritative totals + tax and assigns a
 * server cart id, after a small latency.
 *
 * The service is a FACTORY: it receives its dependencies and runtime options
 * and returns an object of methods. This is what makes it trivially swappable
 * and injectable via the DI container.
 */
// Add real dependencies here (e.g. `requestService: RequestService`) to back
// this with a live API. Empty for now since it uses an in-memory fake.
type Dependencies = Record<string, never>

type Options = {
  config: Config
}

export type ServerError = Error & {
  /** Authoritative cart the server returns alongside a rejection. */
  cartFromServer?: CartDomain.Cart
}

export type CartApiService = ReturnType<typeof CartApiServiceImpl>

const round = (n: number): number => Math.round(n * 100) / 100

export const CartApiServiceImpl = (
  _deps: Dependencies,
  { config }: Options
) => {
  const wait = () =>
    new Promise(resolve => setTimeout(resolve, config.apiDelayMs))

  const computeTotals = (cart: CartDomain.Cart): CartDomain.Totals => {
    const subTotal = round(
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )
    const tax = round(subTotal * config.taxRate)
    return { subTotal, tax, grandTotal: round(subTotal + tax) }
  }

  const settle = async (cart: CartDomain.Cart): Promise<CartDomain.Cart> => {
    await wait()
    return {
      ...cart,
      cartIdKey: cart.cartIdKey ?? `srv_${Date.now()}`,
      totals: computeTotals(cart)
    }
  }

  /** Fetch the authoritative cart for a client-provided cart shell. */
  const getCart = (cart: CartDomain.Cart): Promise<CartDomain.Cart> =>
    settle(cart)

  /** Push local mutations, get back recomputed totals/tax. */
  const updateCart = (cart: CartDomain.Cart): Promise<CartDomain.Cart> =>
    settle(cart)

  return { getCart, updateCart }
}
