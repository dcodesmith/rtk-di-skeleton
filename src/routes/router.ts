import { createBrowserRouter } from 'react-router'
import { routes } from './routes'

/**
 * The browser runtime router for the SPA. Data Mode (`createBrowserRouter` +
 * `<RouterProvider>`) gives us client-side routing with full control over
 * bundling and data — no framework Vite plugin, no SSR.
 */
export const router = createBrowserRouter(routes)
