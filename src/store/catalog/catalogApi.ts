import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Product } from '../../domain/catalog/Product'

/**
 * RTK Query is the right tool for the CATALOG: read-only server data that
 * benefits from caching, dedup, and auto-generated hooks — and needs no
 * optimistic writes or reconciliation. (The CART, by contrast, stays on the
 * thunk + DI + repository path because it does optimistic mutations and
 * server-error reconciliation.)
 *
 * `fakeBaseQuery` + `queryFn` lets us ship a mock backend; swap for
 * `fetchBaseQuery({ baseUrl })` and `query: () => '/products'` to go live.
 */
const mockProducts: Product[] = [
  { id: 'p1', name: 'Espresso Beans (1kg)', price: 18.0 },
  { id: 'p2', name: 'Ceramic Mug', price: 12.5 },
  { id: 'p3', name: 'Pour-over Kettle', price: 42.0 },
  { id: 'p4', name: 'Milk Frother', price: 29.99 }
]

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Product'],
  endpoints: build => ({
    getProducts: build.query<Product[], void>({
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 250))
        return { data: mockProducts }
      },
      providesTags: ['Product']
    })
  })
})

export const { useGetProductsQuery } = catalogApi
