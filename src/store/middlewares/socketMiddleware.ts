import type { Middleware } from '@reduxjs/toolkit'
import type { Config } from '../../domain/Config'
import type { WebSocketService } from '../../services'
import {
  WebSocketServiceImpl,
  SimulatedWebSocketServiceImpl
} from '../../services'
import { getConfig } from '../config'
import {
  realtimeConnectionRequested,
  realtimeDisconnectRequested,
  realtimeConnected,
  realtimeDisconnected,
  realtimeMessageReceived
} from '../realtime'

/** How the middleware obtains its socket service. Injected for tests. */
export type CreateSocketService = (config: Config) => WebSocketService

const defaultCreateService: CreateSocketService = config =>
  // The demo has no real server, so use the simulated socket in dev; the real
  // native-WebSocket service runs everywhere else. Both are the same
  // `WebSocketService` shape, so nothing downstream can tell the difference.
  import.meta.env.DEV
    ? SimulatedWebSocketServiceImpl({}, { config })
    : WebSocketServiceImpl({}, { config })

/**
 * Classic Redux WebSocket middleware — it owns the connection lifecycle:
 *  - `realtimeConnectionRequested` → open the socket and wire its callbacks to
 *    dispatch realtime event actions.
 *  - `realtimeDisconnectRequested` → close it.
 *
 * The socket is built via an injected `WebSocketService` (defaulting through the
 * same service factories the DI container uses), so it stays swappable and
 * unit-testable. Incoming frames become `realtimeMessageReceived` actions;
 * reducers (the realtime slice + cart sub-slices) decide what to do with them.
 * The imperative socket handle never leaks into components or reducers.
 */
export const socketMiddleware =
  ({
    createService = defaultCreateService
  }: {
    createService?: CreateSocketService
  } = {}): Middleware =>
  store => {
    let service: WebSocketService | undefined

    return next => (action: unknown) => {
      const result = next(action)

      if (realtimeConnectionRequested.match(action) && !service) {
        service = createService(getConfig(store.getState()))
        service.connect({
          onOpen: () => store.dispatch(realtimeConnected()),
          onClose: () => {
            service = undefined
            store.dispatch(realtimeDisconnected())
          },
          onEvent: event => store.dispatch(realtimeMessageReceived(event))
        })
      }

      if (realtimeDisconnectRequested.match(action) && service) {
        service.close()
        service = undefined
      }

      return result
    }
  }
