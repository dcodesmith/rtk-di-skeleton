import { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router'
import { bootstrap } from '../store/bootstrap'
import { defaultConfig } from '../domain/Config'
import { useAppDispatch } from '../store/hooks'
import { useCart } from '../store/cart/hooks/useCart'
import { useRealtime } from '../store/realtime/useRealtime'
import { RealtimeBadge } from '../components/RealtimeBadge'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link'

/**
 * The single layout route: it owns app bootstrap (once) and the chrome shared by
 * every page — title, nav, realtime badge — then renders the active page into
 * `<Outlet />`. This is the SPA's application shell.
 */
export const RootLayout = () => {
  const dispatch = useAppDispatch()
  const { loadCart, totalItems } = useCart()
  const { connect: connectRealtime } = useRealtime()

  // biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap must run exactly once on mount, not on every dep change.
  useEffect(() => {
    // 1) Hydrate config + flip app.isInitialized so the DI container can build.
    dispatch(bootstrap({ config: defaultConfig }))
    // 2) Load the cart (thunk -> use case -> repository -> api).
    loadCart()
    // 3) Open the realtime channel (command -> socketMiddleware opens the socket).
    connectRealtime()
  }, [])

  return (
    <main className="app">
      <header>
        <h1>RTK + DI Skeleton</h1>
        <p className="muted">
          Clean-Architecture data flow over a React Router SPA: component → hook
          → thunk → container → use case → repository → service.
        </p>
        <nav className="nav">
          <NavLink to="/" end className={navClass}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={navClass}>
            Cart <span className="badge">{totalItems}</span>
          </NavLink>
        </nav>
        <RealtimeBadge />
      </header>

      <Outlet />
    </main>
  )
}
