import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import mainStatus from './mainStatus';

export default combineReducers({
  routing: routerReducer,
  mainStatus,
});
