import {
  FETCHING_BEGIN,
  FETCHING_END
} from './actions'

const initialStatus = { nowLoading: false};

export default function mainStatus(state = initialStatus, action) {
  if (action.type === FETCHING_BEGIN) {
    return { nowLoading: true};
  } else if (action.type === FETCHING_END) {
    return initialStatus;
  }
  return state;
}