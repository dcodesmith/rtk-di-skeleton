import { useCart } from '../store/cart/hooks/useCart'
import { useItems } from '../store/cart/hooks/useItems'
import { CartItem as CartItemDomain } from '../domain/cart'

/**
 * Reads cart state through `useCart` / `useItems`. Quantity/remove mutations
 * flow through the store and auto-trigger a debounced `updateCart` that
 * recomputes totals + tax on the "server".
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
            <li key={item.id} className="row">
              <span>{item.name}</span>
              <span className="spacer" />
              <div className="qty">
                <button
                  type="button"
                  // Domain rule: quantity can't go below 1, so disable rather
                  // than dispatch a no-op mutation.
                  disabled={!CartItemDomain.canDecrement(item)}
                  onClick={() =>
                    changeQuantity({ id: item.id, quantity: item.quantity - 1 })
                  }
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    changeQuantity({ id: item.id, quantity: item.quantity + 1 })
                  }
                >
                  +
                </button>
              </div>
              <span className="price">
                {CartItemDomain.isFree(item)
                  ? 'Free'
                  : `$${CartItemDomain.lineTotal(item).toFixed(2)}`}
              </span>
              <button
                type="button"
                className="link"
                onClick={() => removeItem(item.id)}
              >
                remove
              </button>
            </li>
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
