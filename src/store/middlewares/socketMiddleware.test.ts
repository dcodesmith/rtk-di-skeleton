import { describe, it, expect, vi, beforeEach } from 'vitest'
import { socketMiddleware } from './socketMiddleware'
import type { SocketHandlers, WebSocketService } from '../../services'
import {
  realtimeConnectionRequested,
  realtimeDisconnectRequested,
  realtimeConnected,
  realtimeDisconnected,
  realtimeMessageReceived
} from '../realtime'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import { createConfig, createCart } from '../../test-support/factories'

const makeFakeService = () => {
  let handlers: SocketHandlers = {}
  const service: WebSocketService & { handlers: () => SocketHandlers } = {
    connect: vi.fn((h: SocketHandlers) => {
      handlers = h
    }),
    close: vi.fn(),
    send: vi.fn(),
    isOpen: vi.fn(() => false),
    handlers: () => handlers
  }
  return service
}

describe('socketMiddleware', () => {
  let service: ReturnType<typeof makeFakeService>
  let dispatch: ReturnType<typeof vi.fn>
  let next: ReturnType<typeof vi.fn>
  let invoke: (action: unknown) => unknown

  beforeEach(() => {
    service = makeFakeService()
    dispatch = vi.fn()
    next = vi.fn((action: unknown) => action)

    const store = { dispatch, getState: () => ({ config: createConfig() }) }
    invoke = socketMiddleware({ createService: () => service })(store as never)(
      next as never
    )
  })

  it('passes every action through to the next middleware', () => {
    const action = { type: 'unrelated' }
    invoke(action)

    expect(next).toHaveBeenCalledWith(action)
  })

  it('opens the socket on realtimeConnectionRequested', () => {
    invoke(realtimeConnectionRequested())

    expect(service.connect).toHaveBeenCalledOnce()
  })

  it('does not open a second socket while one is live', () => {
    invoke(realtimeConnectionRequested())
    invoke(realtimeConnectionRequested())

    expect(service.connect).toHaveBeenCalledOnce()
  })

  it('dispatches lifecycle + message actions from socket callbacks', () => {
    invoke(realtimeConnectionRequested())
    const handlers = service.handlers()

    handlers.onOpen?.()
    expect(dispatch).toHaveBeenCalledWith(realtimeConnected())

    const event = {
      type: RealtimeDomain.CART_UPDATED,
      cart: createCart()
    } as const
    handlers.onEvent?.(event)
    expect(dispatch).toHaveBeenCalledWith(realtimeMessageReceived(event))

    handlers.onClose?.()
    expect(dispatch).toHaveBeenCalledWith(realtimeDisconnected())
  })

  it('closes the socket on realtimeDisconnectRequested', () => {
    invoke(realtimeConnectionRequested())
    invoke(realtimeDisconnectRequested())

    expect(service.close).toHaveBeenCalledOnce()
  })
})
