/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const async = require('async');
const MyDataModelParams = require('../models/myDataModelParams');
const dbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const MyParamValue = require('../models/myParamValue');
const dbValues = require('./dbValues');
const halfHourValuesProducer = require('./halfHourValuesProducer');
const logger = require('../logger');
const moment = require('moment');

const paramValueBuffers = new Map();
const lastTrackedValues = new Map();

const trackHalfHourParamValue = (newParamValue) => {
  const param = MyDataModelParams.getParam(newParamValue.paramName);
  if (param !== undefined) {
    if (param.trackAveragePerHour) {
      let trackedArr = paramValueBuffers.get(newParamValue.paramName);
      if (trackedArr === undefined) {
        trackedArr = [];
      }

      let b = false;
      const halfHourDt = halfHourValuesProducer.getHalfHourTime(moment(newParamValue.dt));
      for (let j = 0; j < trackedArr.length; j += 1) {
        const locTrackedValue = trackedArr[j];
        if (moment(locTrackedValue.dt).isSame(halfHourDt)) {
          locTrackedValue.value = (locTrackedValue.value + newParamValue.value) / 2;
          b = true;
          break;
        }
      }

      if (!b) {
        // eslint-disable-next-line no-param-reassign
        newParamValue.dt = halfHourDt.toDate();
        trackedArr.push(newParamValue);
      }
      paramValueBuffers.set(newParamValue.paramName, trackedArr);
    }
  } else {
    logger.warn(`[DbValuesTracker] Failed to track unknown param: "${newParamValue.paramName}".`);
  }
};

const loadLastTrackedValues = (callback) => {
  const params = MyDataModelParams.getAllParamsAsArray();
  // eslint-disable-next-line no-console
  console.time('loadLastTrackedValues');

  // events.EventEmitter.defaultMaxListeners = 125;
  async.each(params, (param, callback) => {
    dbParamHalfHourValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
      if (err) {
        logger.error(`[DbValuesTracker] Failed to get last half hour value: "${err}".`);
      } else if (paramValue) {
        const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
        lastTrackedValues.set(param.name, lastValue);
      }
      callback(err);
    });
  }, (err) => {
    if (err) {
      // setError(`Importing failed: ${err}`);
    } else {
      // console.info('Importing successed.');
    }
    logger.debug(`[DbValuesTracker] ${lastTrackedValues.size} LastTrackedValues loaded. err="${err}".`);
    // eslint-disable-next-line no-console
    console.timeEnd('loadLastTrackedValues');

    callback(err);
  });
};

let lastTickDT = moment();
setInterval(() => {
  const now = moment().minutes(0).seconds(0).milliseconds(0);

  if (lastTickDT.day() !== now.day()) { // day has changed.
    dbValues.removeOldValues();
  }

  if (!lastTickDT.isSame(now)) {
    lastTickDT = moment(now);
    lastTrackedValues.forEach((lastValue, paramName) => {
      if (paramValueBuffers.has(paramName)) {
        const trackedValues = paramValueBuffers.get(paramName);
        halfHourValuesProducer.produceHalfHourParamValues(now, lastValue, trackedValues, (valuesToInsert, valuesToUpdate, valuesToTrackAgain) => {
          let locLastValue = lastValue;
          valuesToInsert.forEach((newValue) => {
            dbValues.saveHalfHourValue(newValue);

            if (moment(locLastValue.dt).isBefore(moment(newValue.dt))) {
              locLastValue = newValue;
            }
          });

          if (locLastValue !== lastValue) {
            lastTrackedValues.set(paramName, locLastValue);
          }

          valuesToUpdate.forEach((updateValue) => {
            dbValues.updateAverageHalfHourValue(updateValue);
          });

          paramValueBuffers.set(paramName, valuesToTrackAgain);
        });
      }
    });
  }
}, 1800000);


module.exports.loadLastTrackedValues = loadLastTrackedValues;
module.exports.trackHalfHourParamValue = trackHalfHourParamValue;
