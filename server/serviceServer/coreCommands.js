const myCoreCommandType = {
  UNKNOWN: 0,
  PARAM_VALUE: 1,
  NODE_POWERED_STATE: 2,
  NODE_SWITCHED_STATE: 3,
  MANUAL_VALUE: 4,
  RECALCULATION_STATE: 5,
  GET_COLLISIONS: 6,
  COLLISIONS_DETAILS: 6,
  GET_ALL_PARAM_VALUES: 7,
  RES_STATUS: 8,
  SET_ACTIVE_AIR_ALARMS: 9 
};

const serverCommands = [myCoreCommandType.MANUAL_VALUE, myCoreCommandType.GET_COLLISIONS, myCoreCommandType.GET_ALL_PARAM_VALUES, myCoreCommandType.SET_ACTIVE_AIR_ALARMS];

const backgroundCommands = [
  myCoreCommandType.PARAM_VALUE,
  myCoreCommandType.NODE_POWERED_STATE,
  myCoreCommandType.NODE_SWITCHED_STATE,
  myCoreCommandType.RECALCULATION_STATE,
  myCoreCommandType.COLLISIONS_DETAILS,
  myCoreCommandType.RES_STATUS
];

function isServerCommand(myCoreCommandType) {
  return serverCommands.indexOf(myCoreCommandType) > -1;
}

function isBackgroundCommand(myCoreCommandType) {
  return backgroundCommands.indexOf(myCoreCommandType) > -1;
}

module.exports = myCoreCommandType;
module.exports.isServerCommand = isServerCommand;
module.exports.isBackgroundCommand = isBackgroundCommand;
