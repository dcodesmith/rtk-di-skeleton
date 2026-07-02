import {
  CartItem as CartItemDomain,
  Product as ProductDomain
} from '../../domain'
import { MaxItemsReachedError } from '../../domain/errors'
import type { CartItem } from '../../domain/cart/CartItem'
import type { Product } from '../../domain/catalog/Product'

/**
 * Application logic for adding a catalog product to the cart.
 * Pure orchestration over domain functions — enforces the max-items rule and
 * decides whether to create a new line or bump quantity of an existing one.
 *
 * Use cases are factories too, so they can declare their own dependencies.
 */
type Dependencies = Record<string, never>

export type AddItem = ReturnType<typeof AddItemImpl>

export const AddItemImpl =
  (_deps: Dependencies) =>
  (product: Product, allItems: CartItem[], maxItems: number): CartItem => {
    if (allItems.length >= maxItems) {
      throw new MaxItemsReachedError()
    }

    const existing = allItems.find(item =>
      ProductDomain.refersToSameItem(product, item)
    )

    if (existing) {
      return CartItemDomain.incrementQuantity(existing, 1)
    }

    return ProductDomain.toCartItem(product, 1)
  }
