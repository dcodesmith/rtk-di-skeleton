/**
 * Runtime configuration passed into the DI container.
 * In the reference architecture this is hydrated from the server on bootstrap;
 * here we ship a sensible default so the app runs offline.
 */
export type Config = {
  cartApiBaseUrl: string
  /** WebSocket endpoint for server-pushed cart updates (realtime feature). */
  socketUrl: string
  apiDelayMs: number
  taxRate: number
  maxItems: number
}

export const defaultConfig: Config = {
  cartApiBaseUrl: 'https://api.example.test',
  socketUrl: 'wss://realtime.example.test/cart',
  apiDelayMs: 350,
  taxRate: 0.1,
  maxItems: 20
}
