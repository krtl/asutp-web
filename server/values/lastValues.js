const async = require('async');
const logger = require('../logger');

const dbValuesTracker = require('./amqpInsertValueSender');
const MyDataModelParams = require('../models/myDataModelParams');
const DbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const DbParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');


// const logger = require('../logger');

const lastValues = new Map();
let lastChanged = [];
let useDbValueTracker = false;

const setLastValue = (lastValue) => {
  if (useDbValueTracker) {
    dbValuesTracker.TrackDbParamValue(lastValue);
  }

  lastValues.set(lastValue.paramName, lastValue);
  if (lastChanged.indexOf(lastValue.paramName) < 0) {
    lastChanged.push(lastValue.paramName);
  }
};

const getLastChanged = () => {
  const result = lastChanged.slice();
  lastChanged = [];
  return result;
};

const getLastValue = paramName => lastValues.get(paramName);

const getLastValuesCount = () => lastValues.size;

const clearLastValues = () => lastValues.clear();

function init(obj) {
  if (obj.useDbValueTracker) {
    useDbValueTracker = obj.useDbValueTracker;
  }

  restoreLastParamValues(() => {
    dbValuesTracker.Start();
  });
}

function restoreLastParamValues(callback) {
  callback();


  // const params = MyDataModelParams.getAllParamsAsArray();

  // // events.EventEmitter.defaultMaxListeners = 125;
  // async.each(params, (param, callback) => {
  //   DbParamValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
  //     if (err) {
  //       logger.error(`[LastParamValues] Failed to get last value: "${err}".`);
  //       callback(err);
  //     } else if (paramValue) {
  //       const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
  //       lastValues.set(param.name, lastValue);
  //       callback(err);
  //     } else {
  //       DbParamHalfHourValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
  //         if (err) {
  //           logger.error(`[LastParamValues] Failed to get last halfhour value: "${err}".`);
  //           callback(err);
  //         } else if (paramValue) {
  //           const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
  //           lastValues.set(param.name, lastValue);
  //           callback(err);
  //         } else {
  //           // none
  //           callback(err);
  //         }
  //       });
  //     }
  //   });
  // }, (err) => {
  //   if (err) {
  //     // setError(`Importing failed: ${err}`);
  //     logger.error(`[LastParamValues] ${lastValues.size} LastParamValues loaded wirh error: "${err}".`);
  //   } else {
  //     // console.info('Importing successed.');
  //     logger.debug(`[LastParamValues] ${lastValues.size} LastParamValues loaded.`);
  //   }

  //   callback(err);
  // });
}


module.exports.init = init;
module.exports.setLastValue = setLastValue;
module.exports.getLastValue = getLastValue;
module.exports.getLastChanged = getLastChanged;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.clearLastValues = clearLastValues;
