import { Link } from 'react-router'
import { CartView } from '../components/CartView'

/** The "/cart" route: review the cart and its server-computed totals. */
export const CartPage = () => (
  <>
    <CartView />
    <p className="status">
      <Link to="/">← Continue shopping</Link>
    </p>
  </>
)
