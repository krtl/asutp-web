const async = require('async');
const logger = require('../logger');
const moment = require('moment');
const fs = require('fs');
const config = require('../../config');

const dbValuesTracker = require('./amqpInsertValueSender');
const myDataModelNodes = require('../models/myDataModelNodes');
const DbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const DbParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');


// const logger = require('../logger');

const lastValues = new Map();
let lastChanged = [];
let blockedParams = [];
let useDbValueTracker = false;

const setValue = (newValue) => {
  // removing duplicates
  const lastValue = lastValues.get(newValue.paramName);
  if ((!lastValue) || (lastValue.value !== newValue.value) || (lastValue.dt !== newValue.dt)) {
    if (useDbValueTracker) {
      dbValuesTracker.TrackDbParamValue(newValue);
    }

    lastValues.set(newValue.paramName, newValue);
    if (lastChanged.indexOf(newValue.paramName) < 0) {
      lastChanged.push(newValue.paramName);
    }
  }
};

const setRawValue = (newValue) => {
  if (blockedParams.indexOf(newValue.paramName) < 0) {
    setValue(newValue);
  }
};

const setManualValue = (newValue) => {
  // if (blockedParams.indexOf(newValue.paramName) > 0) {
  //   newValue.qd = 'B,S'
  // } else {
  //   newValue.qd = 'S'
  // }

  setValue(newValue);
};

const blockRawValues = (paramName) => {
  if (blockedParams.indexOf(paramName) < 0) {
    blockedParams.push(paramName);
  }
};

const unblockRawValues = (paramName) => {
  const index = blockedParams.indexOf(paramName);
  if (index > -1) {
    blockedParams.splice(index, 1);
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

function init(obj, callback) {
  if (obj.useDbValueTracker) {
    useDbValueTracker = obj.useDbValueTracker;
  }

  restoreLastParamValues(() => {
    restoreBlockedParams(() => {
      dbValuesTracker.Start();
      callback();
    });
  });
}

function restoreLastParamValues(callback) {
  // callback();

  const start = moment();

  const params = myDataModelNodes.GetAllParamsAsArray();

  // events.EventEmitter.defaultMaxListeners = 125;
  async.each(params, (param, callback) => {
    DbParamValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
      if (err) {
        logger.error(`[LastParamValues] Failed to get last value: "${err}".`);
        callback(err);
      } else if (paramValue) {
        const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
        lastValues.set(param.name, lastValue);
        callback(err);
      } else {
        DbParamHalfHourValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
          if (err) {
            logger.error(`[LastParamValues] Failed to get last halfhour value: "${err}".`);
            callback(err);
          } else if (paramValue) {
            const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
            lastValues.set(param.name, lastValue);
            callback(err);
          } else {
            // none
            callback(err);
          }
        });
      }
    });
  }, (err) => {
    if (err) {
      // setError(`Importing failed: ${err}`);
      logger.error(`[LastParamValues] ${lastValues.size} LastParamValues loaded with error: "${err}".`);
    } else {
      // console.info('Importing successed.');
      const duration = moment().diff(start);
      logger.info(`[LastParamValues] ${lastValues.size} LastParamValues loaded in ${moment(duration).format('mm:ss.SSS')}`);
    }

    callback(err);
  });
}


function StoreBlockedParams() {
  const start = moment();
  const data = JSON.stringify(blockedParams);
  const duration1 = moment().diff(start);
  try {
    fs.writeFileSync(`${config.storePath}blockedParams.json`, data);
  } catch (err) {
    logger.error(`[] saving blockedParams error: ${err}`);
    return;
  }
  const duration2 = moment().diff(start);
  logger.debug(`[] blockedParams prepared in ${moment(duration1).format('mm:ss.SSS')} and saved in  ${moment(duration2).format('mm:ss.SSS')}`);
}

function restoreBlockedParams(callback) {
  const start = moment();
  let count = 0;
  blockedParams = [];
  const fileName = `${config.storePath}blockedParams.json`;

  if (!fs.exists(fileName, (exists) => {
    if (!exists) {
      const err = `file "${fileName}" does not exists`;
      logger.warn(`[][blockedParams] failed. File "${fileName}" is not found.`);
      callback(err);
      return;
    }
    fs.readFile(fileName, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      const paramNames = JSON.parse(data);
      const duration1 = moment().diff(start);

      for (let i = 0; i < paramNames.length; i += 1) {
        const paramName = paramNames[i];

        if (myDataModelNodes.GetParam(paramName)) {
          blockedParams.push(paramName);
          count += 1;
        } else {
          logger.warn(`[][RestoreBlockedParams] failed to find param: ${paramName}`);
        }
      }

      const duration2 = moment().diff(start);
      logger.debug(`[] ${count} BlockedParams loaded in ${moment(duration2).format('mm:ss.SSS')} (file loaded and parsed in ${moment(duration1).format('mm:ss.SSS')})`);
      callback();
    });
  }));
}


module.exports.init = init;
module.exports.setRawValue = setRawValue;
module.exports.setManualValue = setManualValue;
module.exports.blockRawValues = blockRawValues;
module.exports.unblockRawValues = unblockRawValues;
module.exports.getLastValue = getLastValue;
module.exports.getLastChanged = getLastChanged;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.clearLastValues = clearLastValues;
module.exports.StoreBlockedParams = StoreBlockedParams;
