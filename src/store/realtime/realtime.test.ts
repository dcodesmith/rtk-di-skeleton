import { describe, it, expect } from 'vitest'
import {
  realtimeSlice,
  realtimeConnectionRequested,
  realtimeConnected,
  realtimeDisconnected,
  realtimeMessageReceived
} from '.'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import { createCart } from '../../test-support/factories'

const reducer = realtimeSlice.reducer

describe('realtime slice', () => {
  it('starts idle with no last event', () => {
    expect(reducer(undefined, { type: '@@init' })).toEqual({
      status: RealtimeDomain.IDLE,
      lastEvent: null
    })
  })

  it('tracks the connection lifecycle', () => {
    let state = reducer(undefined, realtimeConnectionRequested())
    expect(state.status).toBe(RealtimeDomain.CONNECTING)

    state = reducer(state, realtimeConnected())
    expect(state.status).toBe(RealtimeDomain.OPEN)

    state = reducer(state, realtimeDisconnected())
    expect(state.status).toBe(RealtimeDomain.CLOSED)
  })

  it('records the last pushed event', () => {
    const event = {
      type: RealtimeDomain.CART_UPDATED,
      cart: createCart()
    } as const

    const state = reducer(undefined, realtimeMessageReceived(event))

    expect(state.lastEvent).toEqual(event)
  })
})
