import type { CartRepository } from '../../repositories'
import type { Cart } from '../../domain/cart/Cart'

type Dependencies = {
  cartRepository: CartRepository
}

export type UpdateCart = ReturnType<typeof UpdateCartImpl>

export const UpdateCartImpl =
  ({ cartRepository }: Dependencies) =>
  (cart: Cart): Promise<Cart> =>
    cartRepository.updateCart(cart)
