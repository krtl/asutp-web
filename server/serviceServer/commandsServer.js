const myNodeType = require("../models/myNodeType");
const MyDataModelNodes = require("../models/myDataModelNodes");
const MyDataModelSchemas = require("../models/myDataModelSchemas");
const MyStompServer = require("./myStompServer");
const MyNodePoweredStateValue = require("../models/myNodePoweredStateValue");
const MyNodeSwitchedOnStateValue = require("../models/myNodeSwitchedOnStateValue");
const logger = require("../logger");
const MyParamValue = require("../models/myParamValue");
const myCoreCommandType = require("./coreCommands");
const lastParamValues = require("./lastParamValues");
const MyServerStatus = require("./serverStatus");
const tcpClient = require("./simpleTcpClient");

// let tcpClient = undefined;

let paramsInitialized = false;

const initialize = (aTcpClient) => {
  // tcpClient = aTcpClient;
  if (tcpClient) {
    console.log("[commandsServer] initialized with external recalculation server");
  }
};

const sendCommand = (cmd) => {
  // if (tcpClient) {
  //   tcpClient.write(JSON.stringify(cmd));
  // console.log("Sent command to backgound:", cmd);
  // }

  tcpClient.Send(JSON.stringify(cmd));
};

const SetManualValue = (manualValue) => {
  sendCommand({ cmd: myCoreCommandType.MANUAL_VALUE, value: manualValue });

  return null; // for future use
};

const GetCollisions = () => {
  sendCommand({ cmd: myCoreCommandType.GET_COLLISIONS });
  return null;
};

const GetAllParamValues = () => {
  sendCommand({ cmd: myCoreCommandType.GET_ALL_PARAM_VALUES });
  return null;
};

const SetActiveAirAlarms = (AlarmIds) => {
  sendCommand({ cmd: myCoreCommandType.SET_ACTIVE_AIR_ALARMS, value: AlarmIds });
  return null;
};

const processReceivedCommand = (command) => {
  // console.log("Cmd received from backgound:", command);

  if ("cmd" in command) {
    if (myCoreCommandType.isBackgroundCommand(command.cmd)) {
      switch (command.cmd) {
        case myCoreCommandType.PARAM_VALUE: {
          // console.log(`PARAM_VALUE cmd received for "${command.value.paramName}".`);

          const param = MyDataModelNodes.GetParam(command.value.paramName);
          if (param) {
            lastParamValues.setValue(command.value);

            for (let i = 0; i < param.schemaNames.length; i += 1) {
              // const schemaName = param.schemaNames[i];
              let schemaName = param.schemaNames[i];
              if (schemaName.startsWith("schema_of_")) {
                schemaName = schemaName.replace("schema_of_", "");
              }
              // if (setts.useStompServer) {
              MyStompServer.sendParamValue(schemaName, command.value);
              //console.log(`Stomp server sent value of "${command.value.paramName}" for: ${schemaName}.`);

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
              let schemaName = node.schemaNames[i];
              if (schemaName.startsWith("schema_of_")) {
                schemaName = schemaName.replace("schema_of_", "");
              }
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
              // const schemaName = node.schemaNames[i];
              let schemaName = node.schemaNames[i];
              if (schemaName.startsWith("schema_of_")) {
                schemaName = schemaName.replace("schema_of_", "");
              }
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
        case myCoreCommandType.COLLISIONS_DETAILS: {
          MyServerStatus.setCollisions(command.value);
          break;
        }
        case myCoreCommandType.RES_STATUS: {
          // param name = ResName
          let schemaName = MyDataModelSchemas.ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME;
          if (schemaName.startsWith("schema_of_")) {
            schemaName = schemaName.replace("schema_of_", "");
          }          
          MyStompServer.sendParamValue(schemaName, command.value);
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

const ParamsInitialized = () => {
  return paramsInitialized;
};

const SetParamsInitialized = () => {
  return paramsInitialized = true;
};

module.exports.initialize = initialize;
module.exports.processReceivedCommand = processReceivedCommand;
module.exports.sendCommand = sendCommand;
module.exports.SetManualValue = SetManualValue;
module.exports.GetCollisions = GetCollisions;
module.exports.GetAllParamValues = GetAllParamValues;
module.exports.SetActiveAirAlarms = SetActiveAirAlarms;
module.exports.SetParamsInitialized = SetParamsInitialized;
module.exports.ParamsInitialized = ParamsInitialized;
