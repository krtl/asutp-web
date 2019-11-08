import { FETCHING_BEGIN, FETCHING_END, INC_COUNT_OF_UPDATES } from "./actions";

const initialStatus = { nowLoading: false, countOfUpdates: 0 };

export default function mainStatus(state = initialStatus, action) {
  // console.log(state, action);
  if (action.type === FETCHING_BEGIN) {
    state.nowLoading = true;
  } else if (action.type === FETCHING_END) {
    state.nowLoading = false;
  } else if (action.type === INC_COUNT_OF_UPDATES) {
    state.countOfUpdates += 1;
  }
  // return { state };
  return { nowLoading: state.nowLoading, countOfUpdates: state.countOfUpdates };
}
