import {
  LOADING_BEGIN,
  LOADING_END
} from './actions'

const initialStatus = { nowLoading: false};

export default function mainStatus(state = initialStatus, action) {
  if (action.type === LOADING_BEGIN) {
    return { nowLoading: true};
  } else if (action.type === LOADING_END) {
    return initialStatus;
  }
  return state;
}