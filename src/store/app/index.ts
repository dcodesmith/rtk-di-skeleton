import { createSlice } from '@reduxjs/toolkit'
import { bootstrap } from '../bootstrap'
import type { State } from '..'

type AppState = {
  isInitialized: boolean
}

const initialState: AppState = {
  isInitialized: false
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(bootstrap, state => {
      state.isInitialized = true
    })
  }
})

// selectors
export const getIsInitialized = (state: State): boolean =>
  state.app.isInitialized
