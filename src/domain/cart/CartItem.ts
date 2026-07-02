/**
 * Domain model + pure business logic for a single cart line item.
 * No Redux, no I/O — just types and functions.
 */
export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

export const createCartItemId = (productId: string): string =>
  `item_${productId}`

export const incrementQuantity = (item: CartItem, by = 1): CartItem => ({
  ...item,
  quantity: item.quantity + by
})

export const setQuantity = (item: CartItem, quantity: number): CartItem => ({
  ...item,
  quantity: Math.max(1, quantity)
})

export const lineTotal = (item: CartItem): number => item.price * item.quantity

/**
 * Whether the quantity can still be reduced. Quantities are clamped to a minimum
 * of 1 (see `setQuantity`), so use this to *disable* a "decrement" control in the
 * UI instead of letting the user click into a no-op. (See `CartView`.)
 */
export const canDecrement = (item: CartItem): boolean => item.quantity > 1

/** A zero-priced line (e.g. a promo/freebie). Drives "Free" labelling in the UI. */
export const isFree = (item: CartItem): boolean => item.price === 0
