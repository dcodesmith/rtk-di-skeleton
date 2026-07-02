import { describe, it, expect } from 'vitest'
import { CartApiServiceImpl, type CartApiService } from '../cartApiService'
import {
  createConfig,
  createCart,
  createCartItem
} from '../../test-support/factories'

describe('CartApiServiceImpl (mock backend)', () => {
  let service: CartApiService

  beforeEach(() => {
    // taxRate 0.1, no latency.
    service = CartApiServiceImpl({}, { config: createConfig({ taxRate: 0.1 }) })
  })

  it('recomputes authoritative subtotal, tax and grand total', async () => {
    const cart = createCart({
      cartIdKey: 'srv_1',
      items: [
        createCartItem({ id: 'a', price: 18, quantity: 2 }),
        createCartItem({ id: 'b', price: 12.5, quantity: 1 })
      ]
    })

    const result = await service.updateCart(cart)

    expect(result.totals).toEqual({
      subTotal: 48.5,
      tax: 4.85,
      grandTotal: 53.35
    })
  })

  it('assigns a server cart id when the cart does not have one', async () => {
    const cart = createCart({ cartIdKey: null })

    const result = await service.getCart(cart)

    expect(result.cartIdKey).toMatch(/^srv_/)
  })

  it('keeps an existing server cart id', async () => {
    const result = await service.getCart(createCart({ cartIdKey: 'srv_keep' }))

    expect(result.cartIdKey).toBe('srv_keep')
  })
})
