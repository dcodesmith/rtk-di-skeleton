import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createRoutesStub } from 'react-router'
import { routes } from './routes'
import { makeTestStore } from '../test-support/store'
import { AddItemImpl } from '../use-cases/cart/addItem'
import { createCart } from '../test-support/factories'

/**
 * Route-level tests use `createRoutesStub` (the RR-recommended way to give
 * components router context) + a real mock-container store. We feed it the same
 * `routes` tree the app ships.
 */
const renderApp = (initialPath = '/') => {
  const store = makeTestStore({
    container: {
      loadCart: vi.fn().mockResolvedValue(createCart({ items: [] })),
      addItem: AddItemImpl({})
    }
  })
  // `routes` is typed as RouteObject[] (Component can be null); the stub wants a
  // slightly narrower shape, so cast to its param type.
  const Stub = createRoutesStub(
    routes as Parameters<typeof createRoutesStub>[0]
  )

  return {
    store,
    ...render(
      <Provider store={store}>
        <Stub initialEntries={[initialPath]} />
      </Provider>
    )
  }
}

describe('SPA routing', () => {
  it('renders the catalog page at "/"', async () => {
    renderApp('/')

    expect(screen.getByRole('heading', { name: 'Catalog' })).toBeInTheDocument()
    expect(await screen.findByText('Ceramic Mug')).toBeInTheDocument()
  })

  it('renders the cart page at "/cart"', async () => {
    renderApp('/cart')

    expect(screen.getByRole('heading', { name: /^Cart/ })).toBeInTheDocument()
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(screen.getByText('← Continue shopping')).toBeInTheDocument()
  })

  it('navigates between pages via the nav links', async () => {
    renderApp('/')

    await userEvent.click(screen.getByRole('link', { name: /cart/i }))

    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('renders the not-found page inside the layout for unknown URLs', () => {
    renderApp('/does-not-exist')

    // Shell (nav) still present…
    expect(screen.getByRole('link', { name: 'Catalog' })).toBeInTheDocument()
    // …with the 404 body.
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })
})
