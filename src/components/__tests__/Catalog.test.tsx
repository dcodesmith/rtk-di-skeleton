import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Catalog } from '../Catalog'
import { renderWithStore } from '../../test-support/render'
import { AddItemImpl } from '../../use-cases/cart/addItem'
import { getAllItems } from '../../store/cart/selectors'

describe('<Catalog />', () => {
  it('loads and lists products from RTK Query', async () => {
    renderWithStore(<Catalog />, { container: { addItem: AddItemImpl({}) } })

    // Loading state first, then the (mock) server data.
    expect(screen.getByText('Loading catalog…')).toBeInTheDocument()
    expect(await screen.findByText('Ceramic Mug')).toBeInTheDocument()
    expect(screen.getByText('Pour-over Kettle')).toBeInTheDocument()
  })

  it('adds a product to the cart through the addItem thunk + DI container', async () => {
    const { store } = renderWithStore(<Catalog />, {
      container: { addItem: AddItemImpl({}) }
    })

    await screen.findByText('Espresso Beans (1kg)')
    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0])

    expect(getAllItems(store.getState())).toEqual([
      expect.objectContaining({ productId: 'p1', quantity: 1 })
    ])
  })

  it('reflects in-cart state via Product.isInCart / quantityInCart', async () => {
    renderWithStore(<Catalog />, { container: { addItem: AddItemImpl({}) } })

    await screen.findByText('Espresso Beans (1kg)')
    // Nothing is in the cart yet: every row shows the plain "Add" label.
    expect(screen.queryByText(/in cart/)).not.toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0])

    // That row now shows the badge and switches to "Add another".
    expect(await screen.findByText('in cart · 1')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add another' })
    ).toBeInTheDocument()
  })
})
