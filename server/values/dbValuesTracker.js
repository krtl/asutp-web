/* eslint max-len: ["error", { "code": 300 }] */
const MyDataModelParams = require('../models/myDataModelParams');
const dbValues = require('./dbValues');
const logger = require('../logger');

const paramValueBuffers = new Map();
const activeDisconnections = new Map();

const trackDbParamValue = (newParamValue, prevParamValue) => {
  const param = MyDataModelParams.GetParam(newParamValue.paramName);
  if (param !== undefined) {
    if (param.trackAllChanges) {
      dbValues.saveValue(newParamValue);
    }

    // tracking disconnection should be redone to track disconnection on node model.
    if (param.trackDisconnection) {
      if (newParamValue.value !== prevParamValue) {
        const disconnectionStartValue = activeDisconnections.get(newParamValue.paramName);
        if (newParamValue.value === 0) {
          if (disconnectionStartValue === undefined) {
            logger.warn(`[DbValuesTracker] Failed to track end of disconnection for ${newParamValue.paramName} at ${newParamValue.dt}. The start of disconnection was not found.`);
          } else {
                    // save disconnection into db here.
          }
        } else if (disconnectionStartValue === undefined) {
          activeDisconnections.set(newParamValue.paramName, newParamValue);
        } else {
          logger.warn(`[DbValuesTracker] Failed to track start of disconnection for ${newParamValue.paramName} at ${newParamValue.dt}. The start of disconnection is already exists.`);
        }
      }
    }

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

module.exports.trackDbParamValue = trackDbParamValue;
