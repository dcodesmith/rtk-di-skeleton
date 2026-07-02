import { useItems } from '../store/cart/hooks'
import { Product as ProductDomain } from '../domain/catalog'
import { useGetProductsQuery } from '../store/catalog/catalogApi'

/**
 * Reads the catalog through RTK Query (`useGetProductsQuery`) and adds to cart
 * via the `addItem` thunk. Two different data models, deliberately: cached
 * read (RTK Query) vs. optimistic write (thunk + DI).
 *
 * Note how catalog↔cart questions ("is this already in the cart, and how many?")
 * are answered by `Product` domain helpers, not ad-hoc `.find()` calls in JSX —
 * so the "same product" rule stays in the domain and is unit-tested there.
 */
export const Catalog = () => {
  const { data: products = [], isLoading, isError } = useGetProductsQuery()
  const { items, addItem } = useItems()

  return (
    <section className="panel">
      <h2>Catalog</h2>
      {isLoading && <p className="muted">Loading catalog…</p>}
      {isError && <p className="muted">Failed to load catalog.</p>}
      <ul className="list">
        {products.map(product => {
          const inCart = ProductDomain.quantityInCart(product, items)

          return (
            <li key={product.id} className="row">
              <span>{product.name}</span>
              {inCart > 0 && <span className="badge">in cart · {inCart}</span>}
              <span className="spacer" />
              <span className="price">${product.price.toFixed(2)}</span>
              <button type="button" onClick={() => addItem(product)}>
                {ProductDomain.isInCart(product, items) ? 'Add another' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
