import { describe, it, expect } from 'vitest'
import { BrowserStorageServiceImpl } from './browserStorageService'

describe('BrowserStorageServiceImpl', () => {
  const service = BrowserStorageServiceImpl()

  it('round-trips a JSON-serializable value', () => {
    service.set('cart', { cartIdKey: 'srv_1', items: [] })

    expect(service.get('cart')).toEqual({ cartIdKey: 'srv_1', items: [] })
  })

  it('returns null for a missing key', () => {
    expect(service.get('nope')).toBeNull()
  })

  it('returns null (instead of throwing) for corrupt JSON', () => {
    localStorage.setItem('broken', '{not valid')

    expect(service.get('broken')).toBeNull()
  })

  it('destroys a stored value', () => {
    service.set('cart', { a: 1 })
    service.destroy('cart')

    expect(service.get('cart')).toBeNull()
  })
})
