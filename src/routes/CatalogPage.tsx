import { Link } from 'react-router'
import { Catalog } from '../components/Catalog'
import { useCart } from '../store/cart/hooks/useCart'

/** The "/" route: browse the catalog and add items. */
export const CatalogPage = () => {
  const { totalItems } = useCart()

  return (
    <>
      <Catalog />
      {totalItems > 0 && (
        <p className="status">
          <Link to="/cart">Go to cart ({totalItems}) →</Link>
        </p>
      )}
    </>
  )
}
