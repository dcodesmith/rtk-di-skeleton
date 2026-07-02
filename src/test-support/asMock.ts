/**
 * Recursively make every property optional. Lets tests provide only the slice
 * of a dependency they actually exercise. (Ported from the reference app's
 * `test/asMock` + `RecursivePartial` helpers.)
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P]
}

/**
 * Cast a partial mock to its full type. Use for dependencies where a test only
 * touches a couple of methods, e.g. `asMock<CartRepository>({ getCart: vi.fn() })`.
 */
export const asMock = <T>(mock: RecursivePartial<T>): T => mock as unknown as T
