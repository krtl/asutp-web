/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const moment = require("moment");

const myNodeType = require("../models/myNodeType");
const MyDataModelNodes = require("../models/myDataModelNodes");
const lastValues = require("./lastValues");
const MyNodePoweredStateValue = require("../models/myNodePoweredStateValue");
const MyNodeSwitchedOnStateValue = require("../models/myNodeSwitchedOnStateValue");
const ampqRawValuesReceiver = require("./amqpRawValuesReceiver");
const dbNodeStateValuesTracker = require("./amqpInsertNodeStateValueSender");
const logger = require("../logger");
const MyChains = require("../models/myChains");
const commandsServer = require("./commandsBackground");

let timerId;
let recalculateSchema = false;

const initializeParamValuesProcessor = setts => {
  lastValues.init({ useDbValueTracker: setts.useDbValueTracker }, () => {
    recalculateSchema = true;

    MyDataModelNodes.SetStateChangedHandlers(
      (node, oldState, newState) => {
        logger.debug(
          `[state] Powered state changed for Node: ${node.name} from ${oldState} to ${newState}.`
        );
        // eslint-disable-next-line no-console
        console.log(
          `Powered state changed for ${node.name} ${node.nodeType} from ${oldState} to ${newState}. ${node.schemaNames}`
        );

        const nodeStateValue = new MyNodePoweredStateValue(
          node.name,
          oldState,
          newState,
          new Date()
        );
        dbNodeStateValuesTracker.TrackDbNodeStateValue(nodeStateValue);

        commandsServer.SendNodePoweredState(nodeStateValue);

        if (myNodeType.isSchemaRecalculationRequiredFor(node.nodeType)) {
          recalculateSchema = true;
        }
      },
      (node, oldState, newState) => {
        logger.debug(
          `[state] SwitchedOn state changed for Node: ${node.name} from ${oldState} to ${newState}.`
        );
        // eslint-disable-next-line no-console
        console.log(
          `SwitchedOn state changed for ${node.name} ${node.nodeType} from ${oldState} to ${newState}. ${node.schemaNames}`
        );

        const nodeStateValue = new MyNodeSwitchedOnStateValue(
          node.name,
          oldState,
          newState,
          new Date()
        );
        dbNodeStateValuesTracker.TrackDbNodeStateValue(nodeStateValue);

        commandsServer.SendNodeSwitchedState(nodeStateValue);

        if (myNodeType.isSchemaRecalculationRequiredFor(node.nodeType)) {
          recalculateSchema = true;
        }
      }
    );

    dbNodeStateValuesTracker.Start();

    ampqRawValuesReceiver.Start();
  });

  if (process.env.NOWTESTING === undefined) {
    timerId = setInterval(() => {
      const lastChanged = lastValues.getLastChanged();
      for (let i = 0; i < lastChanged.length; i += 1) {
        const paramName = lastChanged[i];
        const value = lastValues.getLastValue(paramName);
        const param = MyDataModelNodes.GetParam(paramName);
        if (param && value) {
          if (param.schemaNames.length > 0) {
            recalculateSchema = true;

            commandsServer.SendParamValue(value);
          }
        }
      }

      if (recalculateSchema) {
        recalculateSchema = false;

        const start = moment();

        MyChains.Recalculate();

        const duration = moment().diff(start);
        // eslint-disable-next-line no-console
        console.debug(
          `Schema recalculated in ${moment(duration).format("mm:ss.SSS")}`
        );

        // ..;
      }
    }, 3000);
  }
};

const finalizeParamValuesProcessor = () => {
  if (process.env.NOWTESTING === undefined) {
    clearInterval(timerId);
    MyDataModelNodes.StoreLastStateValues();
    dbNodeStateValuesTracker.Stop();
    ampqRawValuesReceiver.Stop();    
    lastValues.finalize();
    console.log("[] ParamValuesProcessor finalized ...");
  }
};

module.exports.initializeParamValuesProcessor = initializeParamValuesProcessor;
module.exports.finalizeParamValuesProcessor = finalizeParamValuesProcessor;
