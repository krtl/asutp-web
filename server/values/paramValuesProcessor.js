/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const myDataModelNodes = require('../models/myDataModelNodes');
const MyDataModelParams = require('../models/myDataModelParams');
const lastValues = require('./lastValues');
const MyStompServer = require('./myStompServer');
const myNodeState = require('../models/myNodeState');
const ampqRawValuesReceiver = require('./amqpRawValuesReceiver');
const logger = require('../logger');

let timerId;

const initializeParamValuesProcessor = () => {
  lastValues.init(
    { useDbValueTracker: true });

  myDataModelNodes.SetStateChangedHandler((node, oldState, newState) => {
    logger.info(`[debug] State changed for Node: ${node} from ${oldState} to ${newState}.`);
  });

  ampqRawValuesReceiver.Start();

  timerId = setInterval(() => {
    const recalcPSs = [];
    const lastChanged = lastValues.getLastChanged();
    for (let i = 0; i < lastChanged.length; i += 1) {
      const paramName = lastChanged[i];
      const value = lastValues.getLastValue(paramName);
      const param = MyDataModelParams.getParam(paramName);
      if ((param) && (value)) {
        param.listNames.forEach((lstName) => {
          MyStompServer.sendParamValue(lstName, value);

          if (lstName.startsWith(myNodeState.PARAMLIST_STATE_PREFIX)) {
            const psName = lstName.replace(myNodeState.PARAMLIST_STATE_PREFIX, '');
            if (recalcPSs.indexOf(psName) < 0) {
              recalcPSs.push(psName);
            }
          }
        });
      }
    }

    for (let i = 0; i < recalcPSs.length; i += 1) {
      const ps = recalcPSs[i];
      ps.recalculateState();
    }
  }, 3000);
};

const finalizeParamValuesProcessor = () => {
  clearInterval(timerId);
};


module.exports.initializeParamValuesProcessor = initializeParamValuesProcessor;
module.exports.finalizeParamValuesProcessor = finalizeParamValuesProcessor;

