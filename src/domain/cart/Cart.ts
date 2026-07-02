import type { CartItem } from './CartItem'

/**
 * Cart lifecycle statuses. Mirrors the reference app's status machine:
 * INITIAL -> LOADING -> NOT_SUBMITTED -> FINISHING -> COMPLETED | FAILURE
 */
export const INITIAL = 'INITIAL'
export const LOADING = 'LOADING'
export const NOT_SUBMITTED = 'NOT_SUBMITTED'
export const FINISHING = 'FINISHING'
export const COMPLETED = 'COMPLETED'
export const FAILURE = 'FAILURE'

export type Status =
  | typeof INITIAL
  | typeof LOADING
  | typeof NOT_SUBMITTED
  | typeof FINISHING
  | typeof COMPLETED
  | typeof FAILURE

export type Totals = {
  subTotal: number
  tax: number
  grandTotal: number
}

export const defaultTotals: Totals = {
  subTotal: 0,
  tax: 0,
  grandTotal: 0
}

export type Cart = {
  cartIdKey: string | null
  items: CartItem[]
  totals: Totals
  status: Status
}

/** Only these fields are persisted to browser storage between sessions. */
export type StoredCart = Pick<Cart, 'cartIdKey' | 'items'>

export const create = (stored: StoredCart): Cart => ({
  cartIdKey: stored.cartIdKey,
  items: stored.items,
  totals: defaultTotals,
  status: INITIAL
})

export const isLoaded = (status: Status): boolean =>
  status !== INITIAL && status !== LOADING

export const hasItems = (totalItems: number): boolean => totalItems > 0

/** Inverse of `hasItems`, named for the empty-state it drives in the UI. */
export const isEmpty = (totalItems: number): boolean => !hasItems(totalItems)

export const isCompleted = (status: Status): boolean => status === COMPLETED

/**
 * Whether checkout should be allowed. Composes three smaller predicates so the
 * "when can you check out?" rule lives in one place: the cart must be past its
 * loading states, actually contain items, and not already be completed. Use it
 * to gate/disable a "Checkout" affordance. (See `useCart` + `CartView`.)
 */
export const canCheckout = (status: Status, totalItems: number): boolean =>
  isLoaded(status) && hasItems(totalItems) && !isCompleted(status)

/**
 * When the server rejects a cart mutation it often returns the authoritative
 * cart in the error payload. We merge that server truth back into the local
 * cart so the UI self-heals. (See cartRepository reconciliation.)
 */
export const reconcileFromError = (
  local: Cart,
  fromError: Partial<Cart>
): Cart => ({
  ...local,
  ...fromError,
  items: fromError.items ?? local.items,
  totals: fromError.totals ?? local.totals
})
