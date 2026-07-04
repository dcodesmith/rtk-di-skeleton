import { CartItem as CartItemDomain } from '../domain/cart'
import type { CartItem } from '../domain/cart/CartItem'

type Props = {
  item: CartItem
  onChangeQuantity: (quantity: number) => void
  onRemove: () => void
}

/**
 * Leaf, presentational line item. `item` arrives as a PROP, so the pure domain
 * functions (`lineTotal` / `isFree` / `canDecrement`) are called DIRECTLY here —
 * there's no store to read, so wrapping them in a hook would be pointless
 * indirection. Contrast with `CartView`, which gets *store-derived* flags
 * (`isEmpty`, `canCheckout`) from `useCart`.
 *
 * See README → "Domain functions: call directly, or through a hook?".
 */
export const CartLineItem = ({ item, onChangeQuantity, onRemove }: Props) => (
  <li className="row">
    <span>{item.name}</span>
    <span className="spacer" />
    <div className="qty">
      <button
        type="button"
        // Domain rule (on the prop): quantity can't go below 1, so disable
        // rather than dispatch a no-op mutation.
        disabled={!CartItemDomain.canDecrement(item)}
        onClick={() => onChangeQuantity(item.quantity - 1)}
      >
        −
      </button>
      <span>{item.quantity}</span>
      <button type="button" onClick={() => onChangeQuantity(item.quantity + 1)}>
        +
      </button>
    </div>
    <span className="price">
      {CartItemDomain.isFree(item)
        ? 'Free'
        : `$${CartItemDomain.lineTotal(item).toFixed(2)}`}
    </span>
    <button type="button" className="link" onClick={onRemove}>
      remove
    </button>
  </li>
)
