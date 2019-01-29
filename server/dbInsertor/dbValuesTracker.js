/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const MyDataModelParams = require('../models/myDataModelParams');
const dbParamValues = require('./dbParamValues');
const dbNodeStateValues = require('./dbNodeStateValues');
const logger = require('../logger');
// const moment = require('moment');
const halfHourValuesTracker = require('./halfHourValuesTracker');

const trackDbParamValue = (newParamValue) => {
  const param = MyDataModelParams.getParam(newParamValue.paramName);
  if (param !== undefined) {
    if (param.trackAllChanges) {
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

    if (param.trackAveragePerHour) {
      halfHourValuesTracker.trackHalfHourParamValue(newParamValue);
    }
  } else {
    logger.warn(`[DbValuesTracker] Failed to track unknown param: "${newParamValue.paramName}".`);
  }
};

const trackDbNodeStateValue = (newNodeStateValue) => {
  // const node = MyDataModelNodes.getNode(newNodeStateValue.nodeName);
  // if (node !== undefined) {
  //   if (node.trackAllChanges) {
  dbNodeStateValues.SaveNodeStateValue(newNodeStateValue);
    // }

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

  // } else {
  //   logger.warn(`[DbValuesTracker] Failed to track state for unknown node: "${newNodeStateValue.nodeName}".`);
  // }
};


module.exports.trackDbParamValue = trackDbParamValue;
module.exports.trackDbNodeStateValue = trackDbNodeStateValue;
