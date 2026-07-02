import type { Config } from '../domain/Config'
import { Realtime as RealtimeDomain } from '../domain/realtime'
import type { RealtimeEvent } from '../domain/realtime/RealtimeEvent'

/**
 * Thin, DI-injectable wrapper over the native `WebSocket`. Turns raw socket
 * frames into domain `RealtimeEvent`s and exposes a small lifecycle API.
 *
 * Like every service here it's a FACTORY: it receives its dependencies (the
 * `WebSocket` constructor — injected so tests can pass a fake) and runtime
 * options (config, for the endpoint URL). That's what makes it swappable and
 * unit-testable without a real network.
 */
export type SocketHandlers = {
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onEvent?: (event: RealtimeEvent) => void
}

export type WebSocketService = ReturnType<typeof WebSocketServiceImpl>

type Dependencies = {
  /** Injected so tests can supply a fake WebSocket. Defaults to the global. */
  WebSocketCtor?: typeof WebSocket
}

type Options = {
  config: Config
}

export const WebSocketServiceImpl = (
  { WebSocketCtor = WebSocket }: Dependencies,
  { config }: Options
) => {
  let socket: WebSocket | null = null

  const connect = (handlers: SocketHandlers): void => {
    if (socket) return

    socket = new WebSocketCtor(config.socketUrl)

    socket.onopen = () => handlers.onOpen?.()
    socket.onerror = event => handlers.onError?.(event)
    socket.onclose = () => {
      socket = null
      handlers.onClose?.()
    }
    socket.onmessage = (message: MessageEvent<string>) => {
      const event = RealtimeDomain.parse(message.data)
      if (event) handlers.onEvent?.(event)
    }
  }

  const send = (event: RealtimeEvent): void => {
    socket?.send(RealtimeDomain.serialize(event))
  }

  const close = (): void => {
    socket?.close()
    socket = null
  }

  const isOpen = (): boolean => socket?.readyState === WebSocket.OPEN

  return { connect, send, close, isOpen }
}
