import type { RouteObject } from 'react-router'
import { RootLayout } from './RootLayout'
import { CatalogPage } from './CatalogPage'
import { CartPage } from './CartPage'
import { NotFoundPage } from './NotFoundPage'

/**
 * Route config as plain objects (React Router "Data Mode"). Kept separate from
 * `createBrowserRouter` so tests can feed the same tree into `createRoutesStub`.
 *
 *   /        → CatalogPage   (index)
 *   /cart    → CartPage
 *   *        → NotFoundPage
 *
 * all nested under `RootLayout`, which renders the shared shell + <Outlet/>.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'cart', Component: CartPage },
      { path: '*', Component: NotFoundPage }
    ]
  }
]
