/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const MyDataModelParams = require("./myDataModelParams");
const dbParamValues = require("./dbParamValues");
const logger = require("../logger");
// const moment = require('moment');
const halfHourValuesTracker = require("./halfHourValuesTracker");

const trackDbParamValue = newParamValue => {
  newParamValue.param = MyDataModelParams.GetParam(newParamValue.paramName);
  if (newParamValue.param !== undefined) {
    if (newParamValue.param.trackAllChanges) {
      dbParamValues.SaveParamValue(newParamValue);
    }

    // tracking disconnection should be redone to track disconnection on node model.
    // if (param.trackDisconnection) {
    //   if (newParamValue.value !== prevParamValue) {
    //     const disconnectionStartValue = activeDisconnections.get(newParamValue.paramName);
    //     if (newParamValue.value === 0) {
    //       if (disconnectionStartValue === undefined) {
    //         logger.warn(`[DbValuesTracker] Failed to track end of disconnection for ${newParamValue.paramName} at ${newParamValue.dt}. The start of disconnection was not found.`);
    //       } else {
    //                 // save disconnection into db here.
    //       }
    //     } else if (disconnectionStartValue === undefined) {
    //       activeDisconnections.set(newParamValue.paramName, newParamValue);
    //     } else {
    //       logger.warn(`[DbValuesTracker] Failed to track start of disconnection for ${newParamValue.paramName} at ${newParamValue.dt}. The start of disconnection is already exists.`);
    //     }
    //   }
    // }

    if (newParamValue.param.trackAveragePerHour) {
      halfHourValuesTracker.trackHalfHourParamValue(newParamValue);
    }
  } else {
    logger.warn(
      `[DbValuesTracker] Failed to track unknown param: "${newParamValue.paramName}".`
    );
  }
};

module.exports.trackDbParamValue = trackDbParamValue;
