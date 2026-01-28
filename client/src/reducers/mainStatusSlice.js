import { createSlice } from '@reduxjs/toolkit'

export const mainStatusSlice = createSlice({
  name: 'mainStatus',
  initialState: {
    nowLoading: false,
    countOfUpdates: 0,
    socketStatus: 'unknown',
    collisionsCount: 0,
  },
  reducers: {
    fetchingBegin: state => {
      state.nowLoading = true
    },
    fetchingEnd: state => {
      state.nowLoading = false
    },
    incCountOfUpdates: state => {
      state.countOfUpdates += 1
    },
    setSocketStatus: (state, newstatus) => {
      state.socketStatus = newstatus.payload
    },
    setCollisionsCount: (state, newcount) => {
      state.collisionsCount = newcount.payload
    },         
  }
})

export const { fetchingBegin, fetchingEnd, incCountOfUpdates, setSocketStatus, setCollisionsCount } = mainStatusSlice.actions

export default mainStatusSlice.reducer