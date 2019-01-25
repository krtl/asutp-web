/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const MyDataModelParams = require('../models/myDataModelParams');
const lastValues = require('./lastValues');
const MyStompServer = require('./myStompServer');
const myNodeState = require('../models/myNodeState');
const ampqRawValuesReceiver = require('./amqpRawValuesReceiver');
// const logger = require('../logger');

let timerId;

const initializeParamValuesProcessor = () => {
  lastValues.init(
    { useDbValueTracker: true });

  ampqRawValuesReceiver.Start();

  timerId = setInterval(() => {
    const recalcPSs = [];
    const lastChanged = lastValues.getLastChanged();
    lastChanged.forEach((paramName) => {
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
    });

    recalcPSs.forEach((ps) => {
      ps.recalculateState(() => {

      });
    });
  }, 3000);
};

const finalizeParamValuesProcessor = () => {
  clearInterval(timerId);
};


module.exports.initializeParamValuesProcessor = initializeParamValuesProcessor;
module.exports.finalizeParamValuesProcessor = finalizeParamValuesProcessor;

