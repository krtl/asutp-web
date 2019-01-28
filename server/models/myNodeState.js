  // basicaly this is a state of connection to voltage line
const NODE_STATE_UNKNOWN = -1;
const NODE_STATE_OFF = 0;
const NODE_STATE_ON = 1;
const NODE_STATE_ALARM = 2; // not sure about this. I think alarm should be moved to another variable
const PARAMLIST_STATE_PREFIX = 'StatesOf';

module.exports = {
  NODE_STATE_UNKNOWN,
  NODE_STATE_ON,
  NODE_STATE_OFF,
  NODE_STATE_ALARM,
  PARAMLIST_STATE_PREFIX,
};

