import type { Config } from '../domain/Config'
import { Realtime as RealtimeDomain } from '../domain/realtime'
import type { WebSocketService, SocketHandlers } from './webSocketService'

/**
 * A stand-in `WebSocketService` for the demo: there's no real server, so this
 * "connects" instantly and periodically emits a fake server push (a price
 * change). Same shape as `WebSocketServiceImpl`, so the socket middleware and
 * the rest of the app can't tell the difference — swap it for the real impl to
 * go live. (Analogous to how `cartApiService` mocks the cart backend.)
 */
type Options = {
  config: Config
}

export const SimulatedWebSocketServiceImpl = (
  _deps: Record<string, never>,
  { config: _config }: Options
): WebSocketService => {
  let openTimer: ReturnType<typeof setTimeout> | null = null
  let tick: ReturnType<typeof setInterval> | null = null
  let open = false

  const connect = (handlers: SocketHandlers): void => {
    openTimer = setTimeout(() => {
      open = true
      handlers.onOpen?.()

      let n = 0
      tick = setInterval(() => {
        handlers.onEvent?.({
          type: RealtimeDomain.PRICE_CHANGED,
          productId: 'p1',
          price: 18 + (++n % 3)
        })
      }, 5000)
    }, 300)
  }

  const close = (): void => {
    if (openTimer) clearTimeout(openTimer)
    if (tick) clearInterval(tick)
    openTimer = null
    tick = null
    open = false
  }

  return {
    connect,
    close,
    send: () => {},
    isOpen: () => open
  }
}
