import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { RealtimeBadge } from './RealtimeBadge'
import { renderWithStore } from '../test-support/render'
import { Realtime as RealtimeDomain } from '../domain/realtime'

describe('<RealtimeBadge />', () => {
  it('shows "offline" before connecting', () => {
    renderWithStore(<RealtimeBadge />)

    expect(screen.getByText('offline')).toBeInTheDocument()
  })

  it('shows "live" when the connection is open', () => {
    renderWithStore(<RealtimeBadge />, {
      preloadedState: { realtime: { status: RealtimeDomain.OPEN } }
    })

    expect(screen.getByText('live')).toBeInTheDocument()
  })

  it('shows "disconnected" after the socket closes', () => {
    renderWithStore(<RealtimeBadge />, {
      preloadedState: { realtime: { status: RealtimeDomain.CLOSED } }
    })

    expect(screen.getByText('disconnected')).toBeInTheDocument()
  })

  it('shows the type of the last pushed event', () => {
    renderWithStore(<RealtimeBadge />, {
      preloadedState: {
        realtime: {
          status: RealtimeDomain.OPEN,
          lastEvent: {
            type: RealtimeDomain.PRICE_CHANGED,
            productId: 'p1',
            price: 20
          }
        }
      }
    })

    expect(screen.getByText(RealtimeDomain.PRICE_CHANGED)).toBeInTheDocument()
  })
})
