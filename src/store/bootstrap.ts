import { createAction } from '@reduxjs/toolkit'
import type { Config } from '../domain/Config'

/**
 * A single "hydrate everything" action dispatched once at startup. Multiple
 * slices (`app`, `config`, ...) listen to it via extraReducers. This mirrors
 * the reference app's server-driven bootstrap payload.
 */
export const bootstrap = createAction<{ config: Config }>('app/bootstrap')
