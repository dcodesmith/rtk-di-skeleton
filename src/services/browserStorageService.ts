/**
 * Thin typed wrapper over localStorage. The cart repository uses this to
 * persist the cart between sessions.
 */
export type BrowserStorageService = ReturnType<typeof BrowserStorageServiceImpl>

export const BrowserStorageServiceImpl = () => {
  const get = <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  const set = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const destroy = (key: string): void => {
    localStorage.removeItem(key)
  }

  return { get, set, destroy }
}
