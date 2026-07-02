import type { CartItem } from '../cart/CartItem'
import { createCartItemId } from '../cart/CartItem'

export type Product = {
  id: string
  name: string
  price: number
}

export const toCartItem = (product: Product, quantity = 1): CartItem => ({
  id: createCartItemId(product.id),
  productId: product.id,
  name: product.name,
  price: product.price,
  quantity
})

/** Two catalog references point to the same cart line when product ids match. */
export const refersToSameItem = (product: Product, item: CartItem): boolean =>
  item.productId === product.id

/**
 * How many of this product are already in the cart. Built on `refersToSameItem`
 * so the "same product" rule lives in one place. Use it to render a quantity
 * badge next to a catalog row. (See `Catalog`.)
 */
export const quantityInCart = (product: Product, items: CartItem[]): number =>
  items.find(item => refersToSameItem(product, item))?.quantity ?? 0

/**
 * Whether the product is already in the cart. Drives affordances like switching
 * an "Add" button to "Add another" and showing an "in cart" indicator.
 */
export const isInCart = (product: Product, items: CartItem[]): boolean =>
  quantityInCart(product, items) > 0
