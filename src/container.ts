import type { Config } from './domain/Config'
import {
  RequestServiceImpl,
  BrowserStorageServiceImpl,
  CartApiServiceImpl,
  WebSocketServiceImpl
} from './services'
import { CartRepositoryImpl } from './repositories'
import { AddItemImpl, LoadCartImpl, UpdateCartImpl } from './use-cases'

/** Memoize a factory so the dependency is created at most once per container. */
const singleton = <A extends unknown[], R>(fn: (...args: A) => R) => {
  let cached: R
  let called = false
  return (...args: A): R => {
    if (!called) {
      cached = fn(...args)
      called = true
    }
    return cached
  }
}

/**
 * The dependency registry. Each entry is a FACTORY invoked with
 * `(container, options)`. Because the container resolves lazily via getters,
 * factories can freely reference each other (e.g. cartRepository pulls in
 * cartApiService + browserStorageService) without worrying about order.
 */
const dependencies = {
  // services
  requestService: singleton(RequestServiceImpl),
  browserStorageService: singleton(BrowserStorageServiceImpl),
  cartApiService: singleton(CartApiServiceImpl),
  webSocketService: singleton(WebSocketServiceImpl),

  // repositories
  cartRepository: singleton(CartRepositoryImpl),

  // use cases
  addItem: AddItemImpl,
  loadCart: LoadCartImpl,
  updateCart: UpdateCartImpl
}

type Dependencies = typeof dependencies

/** The resolved container: every factory replaced by its return type. */
export type Container = {
  [K in keyof Dependencies]: ReturnType<Dependencies[K]>
}

export type ContainerOptions = {
  config: Config
}

export const makeContainer = (options: ContainerOptions): Container => {
  const names = Object.keys(dependencies) as (keyof Dependencies)[]

  return names.reduce((container, name) => {
    Object.defineProperty(container, name, {
      // Lazily resolve: the factory receives the container (for its own deps)
      // and the runtime options (config, etc.).
      get: () => (dependencies[name] as Factory)(container, options),
      enumerable: true
    })
    return container
  }, {} as Container)
}

type Factory = (container: Container, options: ContainerOptions) => unknown
