import { createSlice, createAction, type PayloadAction } from '@reduxjs/toolkit'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import type {
  ConnectionStatus,
  RealtimeEvent
} from '../../domain/realtime/RealtimeEvent'
import type { State } from '..'

/**
 * Command actions — dispatched by the UI, consumed by `socketMiddleware`.
 * (Named as intents; the middleware performs the imperative socket work.)
 */
export const realtimeConnectionRequested = createAction(
  'realtime/connectionRequested'
)
export const realtimeDisconnectRequested = createAction(
  'realtime/disconnectRequested'
)

/**
 * Event actions — dispatched by `socketMiddleware` when the socket reports
 * something ("what happened"). Reducers (here and in the cart sub-slices) own
 * the resulting state transitions.
 */
export const realtimeConnected = createAction('realtime/connected')
export const realtimeDisconnected = createAction('realtime/disconnected')
export const realtimeMessageReceived = createAction<RealtimeEvent>(
  'realtime/messageReceived'
)

type RealtimeState = {
  status: ConnectionStatus
  lastEvent: RealtimeEvent | null
}

const initialState: RealtimeState = {
  status: RealtimeDomain.IDLE,
  lastEvent: null
}

export const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(realtimeConnectionRequested, state => {
      state.status = RealtimeDomain.CONNECTING
    })
    builder.addCase(realtimeConnected, state => {
      state.status = RealtimeDomain.OPEN
    })
    builder.addCase(realtimeDisconnected, state => {
      state.status = RealtimeDomain.CLOSED
    })
    builder.addCase(
      realtimeMessageReceived,
      (state, action: PayloadAction<RealtimeEvent>) => {
        state.lastEvent = action.payload
      }
    )
  }
})

// selectors
export const getRealtimeStatus = (state: State): ConnectionStatus =>
  state.realtime.status
export const getLastRealtimeEvent = (state: State): RealtimeEvent | null =>
  state.realtime.lastEvent
