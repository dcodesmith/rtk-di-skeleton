import { describe, it, expect, vi } from 'vitest'
import { LoadCartImpl } from './loadCart'
import { UpdateCartImpl } from './updateCart'
import type { CartRepository } from '../../repositories'
import { asMock } from '../../test-support/asMock'
import { createCart } from '../../test-support/factories'

describe('cart use cases delegate to the repository', () => {
  describe('LoadCartImpl', () => {
    it('returns the cart from cartRepository.getCart', async () => {
      const cart = createCart()
      const cartRepository = asMock<CartRepository>({
        getCart: vi.fn().mockResolvedValue(cart)
      })

      const loadCart = LoadCartImpl({ cartRepository })

      await expect(loadCart()).resolves.toEqual(cart)
      expect(cartRepository.getCart).toHaveBeenCalledOnce()
    })
  })

  describe('UpdateCartImpl', () => {
    it('forwards the cart to cartRepository.updateCart', async () => {
      const cart = createCart()
      const cartRepository = asMock<CartRepository>({
        updateCart: vi.fn().mockResolvedValue(cart)
      })

      const updateCart = UpdateCartImpl({ cartRepository })

      await expect(updateCart(cart)).resolves.toEqual(cart)
      expect(cartRepository.updateCart).toHaveBeenCalledWith(cart)
    })
  })
})
