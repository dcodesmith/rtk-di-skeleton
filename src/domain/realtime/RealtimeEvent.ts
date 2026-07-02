import type { Cart } from '../cart/Cart'

/**
 * Domain model for messages that arrive over the realtime (WebSocket) channel.
 * Pure types + a parser — no I/O, no Redux. The service turns raw socket
 * frames into these; the store reacts to them.
 */
export const CART_UPDATED = 'cartUpdated'
export const PRICE_CHANGED = 'priceChanged'

export type RealtimeEvent =
  /** Server pushed a new authoritative cart (e.g. edited from another tab). */
  | { type: typeof CART_UPDATED; cart: Cart }
  /** A product's price changed server-side. */
  | { type: typeof PRICE_CHANGED; productId: string; price: number }

/** Connection lifecycle, mirrored into the `realtime` slice for the UI. */
export const IDLE = 'idle'
export const CONNECTING = 'connecting'
export const OPEN = 'open'
export const CLOSED = 'closed'

export type ConnectionStatus =
  | typeof IDLE
  | typeof CONNECTING
  | typeof OPEN
  | typeof CLOSED

const isEventType = (value: unknown): value is RealtimeEvent['type'] =>
  value === CART_UPDATED || value === PRICE_CHANGED

/**
 * Parse + validate a raw socket frame into a `RealtimeEvent`.
 * Returns `null` for anything unrecognized so callers can safely ignore noise.
 */
export const parse = (raw: string): RealtimeEvent | null => {
  try {
    const data = JSON.parse(raw) as { type?: unknown }
    if (!isEventType(data.type)) return null
    return data as RealtimeEvent
  } catch {
    return null
  }
}

export const serialize = (event: RealtimeEvent): string => JSON.stringify(event)
