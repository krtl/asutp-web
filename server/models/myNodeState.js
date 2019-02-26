  // basicaly this state described is node connected to the voltage line (supplyed by voltage)
const NODE_STATE_UNKNOWN = -1;
const NODE_STATE_OFF = 0;
const NODE_STATE_ON = 1;
const NODE_STATE_ALARM = 2; // not sure about this. I think alarm should be moved to another variable

module.exports = {
  NODE_STATE_UNKNOWN,
  NODE_STATE_ON,
  NODE_STATE_OFF,
  NODE_STATE_ALARM,
};

