import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CartRepositoryImpl, type CartRepository } from '../cartRepository'
import type {
  CartApiService,
  BrowserStorageService,
  ServerError
} from '../../services'
import { asMock } from '../../test-support/asMock'
import { createCart, createCartItem } from '../../test-support/factories'
import { INITIAL } from '../../domain/cart/Cart'

describe('CartRepositoryImpl', () => {
  let cartApiService: CartApiService
  let browserStorageService: BrowserStorageService
  let repository: CartRepository

  beforeEach(() => {
    browserStorageService = asMock<BrowserStorageService>({
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      destroy: vi.fn()
    })
    cartApiService = asMock<CartApiService>({
      getCart: vi.fn(),
      updateCart: vi.fn()
    })
    repository = CartRepositoryImpl({ cartApiService, browserStorageService })
  })

  describe('#getCart', () => {
    it('hydrates from storage, asks the server, then persists the result', async () => {
      const stored = { cartIdKey: 'srv_1', items: [createCartItem()] }
      const serverCart = createCart({ cartIdKey: 'srv_1' })

      vi.mocked(browserStorageService.get).mockReturnValue(stored)
      vi.mocked(cartApiService.getCart).mockResolvedValue(serverCart)

      const result = await repository.getCart()

      // Server was asked with a fresh cart built from stored fields.
      expect(cartApiService.getCart).toHaveBeenCalledWith(
        expect.objectContaining({
          cartIdKey: 'srv_1',
          items: stored.items,
          status: INITIAL
        })
      )
      // Only storable fields are persisted.
      expect(browserStorageService.set).toHaveBeenCalledWith('cart', {
        cartIdKey: 'srv_1',
        items: serverCart.items
      })
      expect(result).toEqual(serverCart)
    })

    it('defaults to an empty cart when storage is empty', async () => {
      const serverCart = createCart()
      vi.mocked(cartApiService.getCart).mockResolvedValue(serverCart)

      await repository.getCart()

      expect(cartApiService.getCart).toHaveBeenCalledWith(
        expect.objectContaining({ cartIdKey: null, items: [] })
      )
    })
  })

  describe('#updateCart', () => {
    it('pushes the cart and persists the recomputed result', async () => {
      const cart = createCart()
      const settled = createCart({
        totals: { subTotal: 36, tax: 3.6, grandTotal: 39.6 }
      })
      vi.mocked(cartApiService.updateCart).mockResolvedValue(settled)

      const result = await repository.updateCart(cart)

      expect(cartApiService.updateCart).toHaveBeenCalledWith(cart)
      expect(result).toEqual(settled)
      expect(browserStorageService.set).toHaveBeenCalled()
    })
  })

  describe('reconciliation on server error', () => {
    it('merges + persists the authoritative cart from the error, then rethrows it', async () => {
      const local = createCart({ cartIdKey: 'local', items: [] })
      const cartFromServer = createCart({
        cartIdKey: 'srv_truth',
        items: [createCartItem({ quantity: 9 })]
      })

      const error = Object.assign(new Error('conflict'), {
        cartFromServer
      }) as ServerError
      vi.mocked(cartApiService.updateCart).mockRejectedValue(error)

      await expect(repository.updateCart(local)).rejects.toMatchObject({
        message: 'conflict'
      })

      // Reconciled cart persisted...
      expect(browserStorageService.set).toHaveBeenCalledWith('cart', {
        cartIdKey: 'srv_truth',
        items: cartFromServer.items
      })
      // ...and surfaced back on the error for the store to self-heal.
      expect(error.cartFromServer?.cartIdKey).toBe('srv_truth')
    })

    it('rethrows untouched when the error carries no server cart', async () => {
      const error = new Error('network down') as ServerError
      vi.mocked(cartApiService.updateCart).mockRejectedValue(error)

      await expect(repository.updateCart(createCart())).rejects.toThrow(
        'network down'
      )
      expect(browserStorageService.set).not.toHaveBeenCalled()
    })
  })
})
