import { useCart } from '../store/cart/hooks/useCart'
import { useItems } from '../store/cart/hooks/useItems'
import { CartLineItem } from './CartLineItem'

/**
 * Container for the cart. Reads cart state through `useCart` / `useItems`
 * (store-derived values + bound actions), then hands each item down to the
 * presentational `CartLineItem` as a prop. Quantity/remove mutations flow
 * through the store and auto-trigger a debounced `updateCart` that recomputes
 * totals + tax on the "server".
 *
 * Note the split: store-derived flags (`isEmpty`, `canCheckout`) come from the
 * hook here; per-item domain checks live in `CartLineItem`, called directly on
 * the `item` prop. See README → "Domain functions: call directly, or through a
 * hook?".
 */
export const CartView = () => {
  const {
    subTotal,
    tax,
    grandTotal,
    isLoading,
    totalItems,
    status,
    isEmpty,
    canCheckout
  } = useCart()
  const { items, changeQuantity, removeItem } = useItems()

  return (
    <section className="panel">
      <h2>
        Cart <span className="badge">{totalItems}</span>
        {isLoading && <span className="syncing"> syncing…</span>}
      </h2>

      {isEmpty ? (
        <p className="muted">Your cart is empty.</p>
      ) : (
        <ul className="list">
          {items.map(item => (
            <CartLineItem
              key={item.id}
              item={item}
              onChangeQuantity={quantity =>
                changeQuantity({ id: item.id, quantity })
              }
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </ul>
      )}

      <dl className="totals">
        <div>
          <dt>Subtotal</dt>
          <dd>${subTotal.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>${tax.toFixed(2)}</dd>
        </div>
        <div className="grand">
          <dt>Total</dt>
          <dd>${grandTotal.toFixed(2)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="checkout"
        // Gated by the composed `canCheckout` domain rule, not by re-checking
        // status/items here.
        disabled={!canCheckout}
      >
        Checkout
      </button>

      <p className="status">
        status: <code>{status}</code>
      </p>
    </section>
  )
}
