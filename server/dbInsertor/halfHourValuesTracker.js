/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const async = require('async');
const MyDataModelParams = require('../models/myDataModelParams');
const dbParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');
const dbValues = require('./dbValues');

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
  // todo:

  // if day changed then remove old values

  // process buf for each param. if last value for param and timestamp exists then update param value for this dt,
  // if not exists then insert new one.

//  const now = moment().minutes(0).seconds(0).milliseconds(0);
  const now = moment().seconds(0).milliseconds(0);
  if (!lastTickDT.isSame(now)) {
    lastTickDT = moment(now);
    lastTrackedValues.forEach((lastValue, paramName) => {
      // split valuesArr to half hour arrs

      let lastMoment = moment(lastValue.dt).add(1, 'minutes').seconds(0).milliseconds(0);
      if (lastMoment.isBefore(now)) {
        const missedMoments = [];
        do {
          missedMoments.push(moment(lastMoment));
          lastMoment = lastMoment.add(1, 'minutes');
          // trackedValue = trackedValues[i];
        }
        while (lastMoment.isBefore(now));

        let newValueIsTracked = false;
        if (paramValueBuffers.has(paramName)) {
          const trackedValues = paramValueBuffers.get(paramName);
          if (trackedValues.length > 0) {
            for (let i = 0; i < missedMoments; i += 1) {
              const newValue = lastValue;
              newValue.dt = missedMoments[i].toDate();
              let avgValue = 0;
              let avgCount = 0;
              for (let j = 0; j < trackedValues.length; j += 1) {
                const locTrackedValue = trackedValues[j];
                const locTrackedMoment = moment(locTrackedValue.dt);
                const beforeTime = missedMoments[i].substract(1, 'minutes').substract(1, 'seconds');
                const afterTime = missedMoments[i].add(1, 'minutes').add(1, 'seconds');
                if (locTrackedMoment.isBetween(beforeTime, afterTime)) {
                  avgValue += locTrackedValue.value;
                  avgCount += 1;
                }
              }

              if (avgCount > 0) {
                newValue.value = avgValue / avgCount;
              } else {
                // use previos value
              }
              dbValues.saveValue(newValue);
            }

            newValueIsTracked = true;
          }
        }

        if (!newValueIsTracked) {
        // save the last tracked value again
          missedMoments.forEach((locMoment) => {
            const newValue = lastValue;
            newValue.dt = locMoment.toDate();
            dbValues.saveValue(newValue);
          });
        }
      }
    });
  }


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
