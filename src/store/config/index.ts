import { createSlice } from '@reduxjs/toolkit'
import { bootstrap } from '../bootstrap'
import { defaultConfig, type Config } from '../../domain/Config'
import type { State } from '..'

const initialState: Config = defaultConfig

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(bootstrap, (_, action) => action.payload.config)
  }
})

// selectors
export const getConfig = (state: State): Config => state.config
