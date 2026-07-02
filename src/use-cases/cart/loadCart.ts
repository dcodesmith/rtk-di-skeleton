import type { CartRepository } from '../../repositories'
import type { Cart } from '../../domain/cart/Cart'

type Dependencies = {
  cartRepository: CartRepository
}

export type LoadCart = ReturnType<typeof LoadCartImpl>

export const LoadCartImpl =
  ({ cartRepository }: Dependencies) =>
  (): Promise<Cart> =>
    cartRepository.getCart()
