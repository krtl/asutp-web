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
let prevCountOfCollisions = 0;
let prevAvgRecalcTime = 0;
let prevMaxRecalcTime = 0;
let maxRecalcTime = 0;
let collisions = [];

const initializeParamValuesProcessor = (setts, cb) => {
  lastValues.init({ useDbValueTracker: setts.useDbValueTracker }, () => {
    recalculateSchema = true;

    MyDataModelNodes.SetStateChangedHandlers(
      (node, oldState, newState, user) => {
        logger.debug(
          `[state] Powered state changed for Node: ${node.name} from ${oldState} to ${newState}.`
        );

        if (process.env.LOGGER_LEVEL === "debug") {
          // eslint-disable-next-line no-console
          console.log(
            `Powered state changed for ${node.name} ${node.nodeType} from ${oldState} to ${newState}. ${node.schemaNames}`
          );
        }

        const nodeStateValue = new MyNodePoweredStateValue(
          node.name,
          oldState,
          newState,
          new Date()
        );
        dbNodeStateValuesTracker.TrackDbNodePoweredStateValue(nodeStateValue);

        commandsServer.SendNodePoweredState(nodeStateValue);

        if (myNodeType.isSchemaRecalculationRequiredFor(node.nodeType)) {
          recalculateSchema = true;
        }
      },
      (node, oldState, newState, user) => {
        logger.debug(
          `[state] SwitchedOn state changed for Node: ${node.name} from ${oldState} to ${newState}. User: ${user}.`
        );

        if (process.env.LOGGER_LEVEL === "debug") {
          // eslint-disable-next-line no-console
          console.log(
            `SwitchedOn state changed for ${node.name} ${node.nodeType} from ${oldState} to ${newState}. ${node.schemaNames}. User: ${user}.`
          );
        }

        const nodeStateValue = new MyNodeSwitchedOnStateValue(
          node.name,
          oldState,
          newState,
          new Date(),
          user
        );

        // console.log("TrackDbNodeSwitchedOnStateValue: ", nodeStateValue);

        dbNodeStateValuesTracker.TrackDbNodeSwitchedOnStateValue(
          nodeStateValue
        );

        commandsServer.SendNodeSwitchedState(nodeStateValue);

        if (myNodeType.isSchemaRecalculationRequiredFor(node.nodeType)) {
          recalculateSchema = true;
        }
      }
    );

    dbNodeStateValuesTracker.Start();

    ampqRawValuesReceiver.Start();

    cb();
  });

  if (process.env.NOWTESTING === undefined) {
    timerId = setInterval(() => {
      const lastChanged = lastValues.getLastChanged();
      for (let i = 0; i < lastChanged.length; i += 1) {
        const paramName = lastChanged[i];
        const value = lastValues.getLastValue(paramName);
        const param = MyDataModelNodes.GetParam(paramName);
        if (param && value) {
          // if (param.schemaNames.length > 0) {
          // this is not working anymore, so for now recalculation started after each changing
          // This should be redone to start recalculsateion if VV or voltage param changed.

          recalculateSchema = true;

          commandsServer.SendParamValue(value);
          // }
        }
      }

      if (recalculateSchema) {
        recalculateSchema = false;

        const start = moment();

        collisions = MyChains.Recalculate();
        const countOfCollisions = collisions.length;

        const duration = moment().diff(start);
        // eslint-disable-next-line no-console
        console.debug(
          `Schema recalculated in ${moment(duration).format("mm:ss.SSS")}`
        );

        if (maxRecalcTime < duration) {
          maxRecalcTime = duration;
        }

        const avgRecalcTime = Number(
          ((prevAvgRecalcTime * 4 + duration) / 5).toFixed(2)
        );

        if (
          prevCountOfCollisions !== countOfCollisions ||
          prevAvgRecalcTime !== avgRecalcTime ||
          prevMaxRecalcTime !== maxRecalcTime
        ) {
          prevCountOfCollisions = countOfCollisions;
          prevAvgRecalcTime = avgRecalcTime;
          prevMaxRecalcTime = maxRecalcTime;

          commandsServer.SendRecalculationStatus({
            collisionsCount: countOfCollisions,
            avgRecalcTime,
            maxRecalcTime
          });
        }

        // ..;
      }
    }, 3000);
  }
};

const finalizeParamValuesProcessor = () => {
  if (process.env.NOWTESTING === undefined) {
    clearInterval(timerId);
    dbNodeStateValuesTracker.Stop();
    ampqRawValuesReceiver.Stop();
    lastValues.finalize();
    console.log("[] ParamValuesProcessor finalized ...");
  }
};

const getCollisions = () => {
  return collisions;
};

module.exports.initializeParamValuesProcessor = initializeParamValuesProcessor;
module.exports.finalizeParamValuesProcessor = finalizeParamValuesProcessor;
module.exports.getCollisions = getCollisions;
