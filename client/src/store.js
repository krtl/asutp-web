import { configureStore } from '@reduxjs/toolkit'
import mainStatusReducer from './reducers/mainStatusSlice'

export default configureStore({
  reducer: {
     mainStatus: mainStatusReducer
  }
})