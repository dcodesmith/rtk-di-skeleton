import { useSelector } from 'react-redux'
import { useAction } from '../useAction'
import { Realtime as RealtimeDomain } from '../../domain/realtime'
import {
  getRealtimeStatus,
  getLastRealtimeEvent,
  realtimeConnectionRequested,
  realtimeDisconnectRequested
} from '.'

/**
 * The only interface components use for the realtime channel: read connection
 * status + the last pushed event, and issue connect/disconnect commands (which
 * `socketMiddleware` turns into actual socket work).
 */
export const useRealtime = () => {
  const status = useSelector(getRealtimeStatus)
  const lastEvent = useSelector(getLastRealtimeEvent)

  return {
    status,
    lastEvent,
    isLive: status === RealtimeDomain.OPEN,
    connect: useAction(realtimeConnectionRequested),
    disconnect: useAction(realtimeDisconnectRequested)
  }
}
