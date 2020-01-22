const myNodeType = require("../models/myNodeType");
const MyDataModelNodes = require("../models/myDataModelNodes");
const MyStompServer = require("../coreServer/myStompServer");
const MyNodePoweredStateValue = require("../models/myNodePoweredStateValue");
const MyNodeSwitchedOnStateValue = require("../models/myNodeSwitchedOnStateValue");
const logger = require("../logger");
const MyParamValue = require("../models/myParamValue");
const myCoreCommandType = require("../coreServer/coreCommands");
const lastValues = require("./lastValues");

let backgroundProcess = undefined;

const initialize = peerProcess => {
  backgroundProcess = peerProcess;
};

const sendCommand = cmd => {
  if (backgroundProcess) {
    // console.debug("cmd: ", cmd);
    if (backgroundProcess.send)
      // for run under debugger
      backgroundProcess.send(cmd);
  }
};

const SendParamValue = paramValue => {
  sendCommand({ cmd: myCoreCommandType.PARAM_VALUE, value: paramValue });
};

const SendNodePoweredState = nodePoweredState => {
  sendCommand({
    cmd: myCoreCommandType.NODE_POWERED_STATE,
    value: nodePoweredState
  });
};

const SendNodeSwitchedState = nodeSwitchedState => {
  sendCommand({
    cmd: myCoreCommandType.NODE_SWITCHED_STATE,
    value: nodeSwitchedState
  });
};

const SendRecalculationStatus = status => {
  sendCommand({
    cmd: myCoreCommandType.RECALCULATION_STATE,
    value: status
  });
};

const processReceivedCommand = command => {
  //   console.log("background received a command: ", command);

  if ("cmd" in command) {
    if (myCoreCommandType.isServerCommand(command.cmd)) {
      switch (command.cmd) {
        case myCoreCommandType.MANUAL_VALUE: {
          lastValues.SetManualValue(command.value);
          break;
        }
        default: {
          return Error(`Unknown command: ${command.cmd}`);
        }
      }
    } else {
      return Error(`Wrong source of command: ${command.cmd}`);
    }
  } else {
    return Error(`Unknown command object: ${command}`);
  }
};

module.exports.initialize = initialize;
module.exports.processReceivedCommand = processReceivedCommand;
module.exports.sendCommand = sendCommand;
module.exports.SendParamValue = SendParamValue;
module.exports.SendNodePoweredState = SendNodePoweredState;
module.exports.SendNodeSwitchedState = SendNodeSwitchedState;
module.exports.SendRecalculationStatus = SendRecalculationStatus;
