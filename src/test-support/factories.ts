import type { Config } from '../domain/Config'
import { defaultConfig } from '../domain/Config'
import type { CartItem } from '../domain/cart/CartItem'
import type { Cart, Totals } from '../domain/cart/Cart'
import { defaultTotals, NOT_SUBMITTED } from '../domain/cart/Cart'
import type { Product } from '../domain/catalog/Product'

/**
 * Domain factories: build valid objects with sensible defaults, override only
 * what a test cares about. (Mirrors the reference app's `test/factories/domain`.)
 */
export const createConfig = (overrides: Partial<Config> = {}): Config => ({
  ...defaultConfig,
  apiDelayMs: 0, // no artificial latency in tests
  ...overrides
})

export const createProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Espresso Beans (1kg)',
  price: 18,
  ...overrides
})

export const createCartItem = (
  overrides: Partial<CartItem> = {}
): CartItem => ({
  id: 'item_p1',
  productId: 'p1',
  name: 'Espresso Beans (1kg)',
  price: 18,
  quantity: 1,
  ...overrides
})

export const createTotals = (overrides: Partial<Totals> = {}): Totals => ({
  ...defaultTotals,
  ...overrides
})

export const createCart = (overrides: Partial<Cart> = {}): Cart => ({
  cartIdKey: 'srv_1',
  items: [createCartItem()],
  totals: createTotals({ subTotal: 18, tax: 1.8, grandTotal: 19.8 }),
  status: NOT_SUBMITTED,
  ...overrides
})
