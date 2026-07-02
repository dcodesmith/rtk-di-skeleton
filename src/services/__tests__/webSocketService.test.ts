import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  WebSocketServiceImpl,
  type WebSocketService
} from '../webSocketService'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import { createConfig, createCart } from '../../test-support/factories'

/** Minimal fake WebSocket that lets tests drive lifecycle callbacks. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = []
  static OPEN = 1

  url: string
  readyState = 0
  sent: string[] = []
  closed = false
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null

  constructor(url: string) {
    this.url = url
    FakeWebSocket.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.closed = true
    this.readyState = 3
    this.onclose?.()
  }

  // test helpers
  emitOpen() {
    this.readyState = 1
    this.onopen?.()
  }
  emitMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent<string>)
  }
}

const makeService = (): WebSocketService =>
  WebSocketServiceImpl(
    { WebSocketCtor: FakeWebSocket as unknown as typeof WebSocket },
    { config: createConfig({ socketUrl: 'wss://test/cart' }) }
  )

describe('WebSocketServiceImpl', () => {
  beforeEach(() => {
    FakeWebSocket.instances = []
  })

  describe('#connect', () => {
    it('opens a socket against the configured url', () => {
      makeService().connect({})

      expect(FakeWebSocket.instances).toHaveLength(1)
      expect(FakeWebSocket.instances[0].url).toBe('wss://test/cart')
    })

    it('does not open a second socket if already connected', () => {
      const service = makeService()
      service.connect({})
      service.connect({})

      expect(FakeWebSocket.instances).toHaveLength(1)
    })

    it('invokes onOpen and onClose', () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const service = makeService()

      service.connect({ onOpen, onClose })
      const socket = FakeWebSocket.instances[0]

      socket.emitOpen()
      expect(onOpen).toHaveBeenCalledOnce()

      socket.close()
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('parses incoming frames into domain events and forwards valid ones', () => {
      const onEvent = vi.fn()
      const service = makeService()
      service.connect({ onEvent })
      const socket = FakeWebSocket.instances[0]

      const cart = createCart()
      socket.emitMessage(
        JSON.stringify({ type: RealtimeDomain.CART_UPDATED, cart })
      )

      expect(onEvent).toHaveBeenCalledWith({
        type: RealtimeDomain.CART_UPDATED,
        cart
      })
    })

    it('ignores unrecognized frames', () => {
      const onEvent = vi.fn()
      const service = makeService()
      service.connect({ onEvent })

      FakeWebSocket.instances[0].emitMessage('garbage')

      expect(onEvent).not.toHaveBeenCalled()
    })
  })

  describe('#send', () => {
    it('serializes an event onto the socket', () => {
      const service = makeService()
      service.connect({})

      service.send({
        type: RealtimeDomain.PRICE_CHANGED,
        productId: 'p1',
        price: 20
      })

      expect(FakeWebSocket.instances[0].sent).toEqual([
        JSON.stringify({
          type: RealtimeDomain.PRICE_CHANGED,
          productId: 'p1',
          price: 20
        })
      ])
    })
  })

  describe('#isOpen / #close', () => {
    it('reports open state and closes the socket', () => {
      const service = makeService()
      service.connect({})
      const socket = FakeWebSocket.instances[0]

      expect(service.isOpen()).toBe(false)
      socket.emitOpen()
      expect(service.isOpen()).toBe(true)

      service.close()
      expect(socket.closed).toBe(true)
    })
  })
})
