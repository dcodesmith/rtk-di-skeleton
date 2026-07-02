import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartView } from '../CartView'
import { renderWithStore } from '../../test-support/render'
import { makeTestStore } from '../../test-support/store'
import { loadCart } from '../../store/cart/thunks/loadCart'
import { createCart, createCartItem } from '../../test-support/factories'

const seededStore = () => {
  const store = makeTestStore()
  store.dispatch(
    loadCart.fulfilled(
      createCart({
        items: [
          createCartItem({
            id: 'item_p1',
            name: 'Espresso Beans',
            price: 18,
            quantity: 1
          })
        ],
        totals: { subTotal: 18, tax: 1.8, grandTotal: 19.8 }
      }),
      'req'
    )
  )
  return store
}

describe('<CartView />', () => {
  it('renders items and server totals', () => {
    renderWithStore(<CartView />, { store: seededStore() })

    expect(screen.getByText('Espresso Beans')).toBeInTheDocument()
    expect(screen.getByText('$1.80')).toBeInTheDocument() // tax
    expect(screen.getByText('$19.80')).toBeInTheDocument() // grand total
    // line total + subtotal are both $18.00 here.
    expect(screen.getAllByText('$18.00')).toHaveLength(2)
  })

  it('shows the empty state when there are no items', () => {
    renderWithStore(<CartView />)

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('increments quantity via the + button', async () => {
    renderWithStore(<CartView />, { store: seededStore() })

    await userEvent.click(screen.getByRole('button', { name: '+' }))

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('$36.00')).toBeInTheDocument()
  })

  it('removes an item via the remove button', async () => {
    renderWithStore(<CartView />, { store: seededStore() })

    await userEvent.click(screen.getByRole('button', { name: 'remove' }))

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('disables the decrement button at the minimum quantity (CartItem.canDecrement)', () => {
    renderWithStore(<CartView />, { store: seededStore() })

    expect(screen.getByRole('button', { name: '−' })).toBeDisabled()
  })

  it('renders "Free" for a zero-priced line (CartItem.isFree)', () => {
    const store = makeTestStore()
    store.dispatch(
      loadCart.fulfilled(
        createCart({
          items: [createCartItem({ name: 'Promo Sticker', price: 0 })]
        }),
        'req'
      )
    )
    renderWithStore(<CartView />, { store })

    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('disables Checkout for an empty, not-yet-loaded cart (Cart.canCheckout)', () => {
    renderWithStore(<CartView />)

    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled()
  })

  it('enables Checkout once the cart is loaded and non-empty (Cart.canCheckout)', () => {
    renderWithStore(<CartView />, { store: seededStore() })

    expect(screen.getByRole('button', { name: 'Checkout' })).toBeEnabled()
  })
})
