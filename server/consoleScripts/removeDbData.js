const mongoose = require("mongoose");
// const dbParam = require('../dbmodels/param');
const dbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require('../dbmodels/blockedParam');
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");

const async = require("async");
const config = require("../../config");

async.series(
  [
    open,
    removeParamValueData,
    removeParamHalfHourValueData,
    removeBlockedParams,
    removeNodePoweredStateValues,
    removeNodeSwitchedOnStateValues
  ],
  err => {
    //  console.log(arguments);
    mongoose.disconnect();

    if (err) console.error(err);
    console.log("done");

    process.exit(err ? 1 : 0);
  }
);

function open(callback) {
  console.log("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
}

function removeParamValueData(callback) {
  dbParamValue.deleteMany({}, err => {
    if (err) throw callback(err);
    callback();
  });
}

function removeParamHalfHourValueData(callback) {
  DbParamHalfHourValue.deleteMany({}, err => {
    if (err) throw callback(err);
    callback();
  });
}

function removeBlockedParams(callback) {
  DbBlockedParam.deleteMany({}, err => {
    if (err) throw callback(err);
    callback();
  });
}

function removeNodePoweredStateValues(callback) {
  DbNodePoweredStateValue.deleteMany({}, err => {
    if (err) throw callback(err);
    callback();
  });
}

function removeNodeSwitchedOnStateValues(callback) {
  DbNodeSwitchedOnStateValue.deleteMany({}, err => {
    if (err) throw callback(err);
    callback();
  });
}
