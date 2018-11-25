/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const async = require('async');
const MyDataModelParams = require('../models/myDataModelParams');
const dbParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');

// const dbValues = require('./dbValues');
const logger = require('../logger');


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
  // events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(params, (param, callback) => {
    dbParamValue.findOne({ paramName: param.name }, (err, paramValue) => {
      if (err) {
        logger.errorr(`[DbValuesTracker] Failed to get last value: "${err}".`);
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
    callback(err);
  }, (err) => {
    callback(err);
  });
};


setInterval(() => {
  // todo:

  // if day changed then remove old values

  // process buf for each param. if last value for param and timestamp exists then update param value for this dt,
  // if not exists then insert new one.

  // const lastChanged = lastValues.getLastChanged();
  // lastChanged.forEach((paramName) => {
  //   const value = lastValues.getLastValue(paramName);
  //   const param = MyDataModelParams.getParam(paramName);
  //   if ((param) && (value)) {
  //     param.listNames.forEach((lstName) => {
  //       stompServer.send(TOPIC_VALUES + lstName, {}, JSON.stringify(value));
  //     });
  //   }
  // });
}, 10000); // 30 min


module.exports.loadLastTrackedValues = loadLastTrackedValues;
module.exports.trackHalfHourParamValue = trackHalfHourParamValue;
