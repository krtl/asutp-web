/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const myNodeType = require('../models/myNodeType');
const MyDataModelNodes = require('../models/myDataModelNodes');
const lastValues = require('./lastValues');
const MyStompServer = require('./myStompServer');
const MyNodeStateValue = require('../models/myNodeStateValue');
const ampqRawValuesReceiver = require('./amqpRawValuesReceiver');
const dbNodeStateValuesTracker = require('./amqpInsertNodeStateValueSender');
const logger = require('../logger');

let timerId;
let recalculateSchema = false;

const initializeParamValuesProcessor = () => {
  lastValues.init(
    { useDbValueTracker: true }, () => {
      MyDataModelNodes.SetStateChangedHandler((node, oldState, newState) => {
        logger.info(`[debug] State changed for Node: ${node.name} from ${oldState} to ${newState}.`);

        const nodeStateValue = new MyNodeStateValue(node.name, oldState, newState, new Date());
        dbNodeStateValuesTracker.TrackDbNodeStateValue(nodeStateValue);

        for (let i = 0; i < node.schemaNames.length; i += 1) {
          const schemaName = node.schemaNames[i];
          MyStompServer.sendNodeStateValue(schemaName, nodeStateValue);
        }

        if (myNodeType.isSchemaRecalculationRequiredFor(node.nodeType)) {
          recalculateSchema = true;
        }
      });

      dbNodeStateValuesTracker.Start();

      ampqRawValuesReceiver.Start();
    });

  timerId = setInterval(() => {
    const recalcPSs = [];
    const lastChanged = lastValues.getLastChanged();
    for (let i = 0; i < lastChanged.length; i += 1) {
      const paramName = lastChanged[i];
      const value = lastValues.getLastValue(paramName);
      const param = MyDataModelNodes.GetParam(paramName);
      if ((param) && (value)) {
        for (let i = 0; i < param.schemaNames.length; i += 1) {
          const schemaName = param.schemaNames[i];
          MyStompServer.sendParamValue(schemaName, value);

          if (param.stateVarOf) {
            if (recalcPSs.indexOf(param.stateVarOf) < 0) {
              recalcPSs.push(param.stateVarOf);
            }
          }
        }
      }
    }

    for (let i = 0; i < recalcPSs.length; i += 1) {
      const ps = MyDataModelNodes.GetNode(recalcPSs[i]);
      if (ps) {
        ps.recalculateState();
      } else {
        logger.warn(`[!] Can't recalculate PS state. Unknown PS: "${recalcPSs[i]}"`);
      }
    }

    if (recalculateSchema) {
      recalculateSchema = false;

      // ..;
    }
  }, 3000);
};

const finalizeParamValuesProcessor = () => {
  clearInterval(timerId);
  MyDataModelNodes.StoreLastStateValues();
};


module.exports.initializeParamValuesProcessor = initializeParamValuesProcessor;
module.exports.finalizeParamValuesProcessor = finalizeParamValuesProcessor;

