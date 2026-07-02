/**
 * Low-level HTTP wrapper. Every API service depends on this rather than
 * calling `fetch` directly, so retries/auth/headers live in one place.
 *
 * (In the reference app this wraps an internal request util; here it's a thin
 * fetch wrapper. The mock cartApiService does not actually hit the network.)
 */
export type RequestService = ReturnType<typeof RequestServiceImpl>

export const RequestServiceImpl = () => {
  const get = async <T>(url: string): Promise<T> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
    return res.json() as Promise<T>
  }

  const post = async <T>(url: string, body: unknown): Promise<T> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
    return res.json() as Promise<T>
  }

  return { get, post }
}
