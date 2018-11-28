/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const async = require('async');
const MyDataModelParams = require('../models/myDataModelParams');
const dbParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');
const dbValues = require('./dbValues');
const halfHourValuesProducer = require('./halfHourValuesProducer');
// const dbValues = require('./dbValues');
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
      trackedArr.push(newParamValue);
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
    dbParamValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
      if (err) {
        logger.error(`[DbValuesTracker] Failed to get last value: "${err}".`);
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
    logger.debug(`[DbValuesTracker] LastTrackedValues loaded. err="${err}".`);
    // eslint-disable-next-line no-console
    console.timeEnd('loadLastTrackedValues');

    callback(err);
  });
};

let lastTickDT = moment();// .minutes(0).seconds(0).milliseconds(0);
setInterval(() => {
//  const now = moment().minutes(0).seconds(0).milliseconds(0);

  const now = moment().seconds(0).milliseconds(0);
  if (!lastTickDT.isSame(now)) {
    lastTickDT = moment(now);
    lastTrackedValues.forEach((lastValue, paramName) => {
      if (paramValueBuffers.has(paramName)) {
        const trackedValues = paramValueBuffers.get(paramName);
        halfHourValuesProducer.produceHalfHourParamValues(now, lastValue, trackedValues, (valuesToInsert, valuesToUpdate, valuesToTrackAgain) => {
          let locLastValue = lastValue;
          valuesToInsert.forEach((newValue) => {
            dbValues.saveValue(newValue);

            if (moment(locLastValue.dt).isBefore(moment(newValue.dt))) {
              locLastValue = newValue;
            }
          });

          if (locLastValue !== lastValue) {
            lastTrackedValues.set(paramName, locLastValue);
          }

          valuesToUpdate.forEach((updateValue) => {
            dbValues.updateAverageValue(updateValue);
          });

          paramValueBuffers.set(paramName, valuesToTrackAgain);
        });
      }
    });
  }
}, 10000); // 30 min


module.exports.loadLastTrackedValues = loadLastTrackedValues;
module.exports.trackHalfHourParamValue = trackHalfHourParamValue;
