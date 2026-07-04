import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartLineItem } from './CartLineItem'
import { createCartItem } from '../test-support/factories'

/**
 * `CartLineItem` takes its data as props, so it needs NO store/provider — plain
 * RTL `render` is enough. That's the payoff of calling domain functions directly
 * on a prop instead of through a hook.
 */
const renderRow = (
  item = createCartItem(),
  props: Partial<Parameters<typeof CartLineItem>[0]> = {}
) =>
  render(
    <ul>
      <CartLineItem
        item={item}
        onChangeQuantity={props.onChangeQuantity ?? vi.fn()}
        onRemove={props.onRemove ?? vi.fn()}
      />
    </ul>
  )

describe('<CartLineItem />', () => {
  it('renders the name and the domain line total', () => {
    renderRow(createCartItem({ name: 'Ceramic Mug', price: 10, quantity: 2 }))

    expect(screen.getByText('Ceramic Mug')).toBeInTheDocument()
    expect(screen.getByText('$20.00')).toBeInTheDocument() // CartItem.lineTotal
  })

  it('renders "Free" for a zero-priced item (CartItem.isFree)', () => {
    renderRow(createCartItem({ price: 0 }))

    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('disables the decrement button at the minimum quantity (CartItem.canDecrement)', () => {
    renderRow(createCartItem({ quantity: 1 }))

    expect(screen.getByRole('button', { name: '−' })).toBeDisabled()
  })

  it('reports quantity changes via the callback', async () => {
    const onChangeQuantity = vi.fn()
    renderRow(createCartItem({ quantity: 2 }), { onChangeQuantity })

    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onChangeQuantity).toHaveBeenCalledWith(3)

    await userEvent.click(screen.getByRole('button', { name: '−' }))
    expect(onChangeQuantity).toHaveBeenCalledWith(1)
  })

  it('reports removal via the callback', async () => {
    const onRemove = vi.fn()
    renderRow(createCartItem(), { onRemove })

    await userEvent.click(screen.getByRole('button', { name: 'remove' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
