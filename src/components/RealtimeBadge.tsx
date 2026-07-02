import { useRealtime } from '../store/realtime/useRealtime'
import { Realtime as RealtimeDomain } from '../domain/realtime'

const label: Record<string, string> = {
  [RealtimeDomain.IDLE]: 'offline',
  [RealtimeDomain.CONNECTING]: 'connecting…',
  [RealtimeDomain.OPEN]: 'live',
  [RealtimeDomain.CLOSED]: 'disconnected'
}

/**
 * Tiny live-connection indicator. Reads realtime state through `useRealtime`
 * only — it has no idea a WebSocket exists. The last server push is shown so
 * you can see events arriving over the socket.
 */
export const RealtimeBadge = () => {
  const { status, isLive, lastEvent } = useRealtime()

  return (
    <p className="status">
      realtime: <code>{label[status] ?? status}</code>
      <span aria-hidden> {isLive ? '🟢' : '⚪️'}</span>
      {lastEvent && (
        <>
          {' '}
          · last push: <code>{lastEvent.type}</code>
        </>
      )}
    </p>
  )
}
