const myNodeState = {  // basicaly this is a state of connection to voltage line
  UNKNOWN: 0,
  ON: 1,
  OFF: 2,
  ALARM: 3, // not sure about this. I think alarm should be moved to another variable
};

const PARAMLIST_STATE_PREFIX = 'StatesOf';

module.exports = {
  myNodeState,
  PARAMLIST_STATE_PREFIX,
};

