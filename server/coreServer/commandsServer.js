const myNodeType = require("../models/myNodeType");
const MyDataModelNodes = require("../models/myDataModelNodes");
const MyStompServer = require("../coreServer/myStompServer");
const MyNodePoweredStateValue = require("../models/myNodePoweredStateValue");
const MyNodeSwitchedOnStateValue = require("../models/myNodeSwitchedOnStateValue");
const logger = require("../logger");
const MyParamValue = require("../models/myParamValue");
const myCoreCommandType = require("./coreCommands");
const lastParamValues = require("./lastParamValues");
const MyServerStatus = require("./serverStatus");

let backgroundProcess = undefined;

const initialize = peerProcess => {
  backgroundProcess = peerProcess;
};

const sendCommand = cmd => {
  if (backgroundProcess) {
    backgroundProcess.send(cmd);

    // console.log("Sent command to backgound:", cmd);
  }
};

const SetManualValue = manualValue => {
  sendCommand({ cmd: myCoreCommandType.MANUAL_VALUE, value: manualValue });

  return null; // for future use
};

const processReceivedCommand = command => {
  let err = "";

  //   console.log("Cmd received from backgound:", command);

  if ("cmd" in command) {
    if (myCoreCommandType.isBackgroundCommand(command.cmd)) {
      switch (command.cmd) {
        case myCoreCommandType.PARAM_VALUE: {
          const param = MyDataModelNodes.GetParam(command.value.paramName);
          if (param) {
            lastParamValues.setValue(command.value);

            for (let i = 0; i < param.schemaNames.length; i += 1) {
              const psSchemaName = param.schemaNames[i];

              // if (setts.useStompServer) {
              MyStompServer.sendParamValue(psSchemaName, command.value);
              // }
            }
          } else {
            return Error(
              `Unknown param in command: ${command.value.paramName}`
            );
          }
          break;
        }
        case myCoreCommandType.NODE_POWERED_STATE: {
          const node = MyDataModelNodes.GetNode(command.value.nodeName);
          //   if ((node) && (node.powered)) {
          if (node) {
            node.powered = command.value.newState;

            // if (setts.useStompServer) {
            for (let i = 0; i < node.schemaNames.length; i += 1) {
              const schemaName = node.schemaNames[i];
              MyStompServer.sendNodeStateValue(schemaName, command.value);
            }
            //   }
          } else {
            return Error(`Unknown node in command: ${command.value.nodeName}`);
          }
          break;
        }
        case myCoreCommandType.NODE_SWITCHED_STATE: {
          const node = MyDataModelNodes.GetNode(command.value.connectorName);
          if (node) {
            node.switchedOn = command.value.newState;

            // if (setts.useStompServer) {
            for (let i = 0; i < node.schemaNames.length; i += 1) {
              const schemaName = node.schemaNames[i];
              MyStompServer.sendNodeStateValue(schemaName, command.value);
            }
            //   }
          } else {
            return Error(
              `Unknown node in command: ${command.value.connectorName}`
            );
          }
          break;
        }
        case myCoreCommandType.RECALCULATION_STATE: {
          MyServerStatus.setRecalculationStatus(command.value);
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
module.exports.SetManualValue = SetManualValue;
