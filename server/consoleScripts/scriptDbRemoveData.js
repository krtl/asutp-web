const mongoose = require("mongoose");
// const dbParam = require('../dbmodels/param');
const dbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");

const async = require("async");
const config = require("../../config");

async.series(
  [
    openDBConnection,
    removeParamValueData,
    removeParamHalfHourValueData,
    removeBlockedParams,
    removeNodePoweredStateValues,
    removeNodeSwitchedOnStateValues,
    closeDBConnection
  ],
  err => {
    //  console.log(arguments);
    mongoose.disconnect();

    if (err) console.error(err);
    console.log("done");

    process.exit(err ? 1 : 0);
  }
);

function openDBConnection(callback) {
  console.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
}

function closeDBConnection(callback) {
  mongoose.connection.close();
  callback();
}

function removeParamValueData(callback) {
  dbParamValue.deleteMany({}, err => {
    callback(err);
  });
}

function removeParamHalfHourValueData(callback) {
  DbParamHalfHourValue.deleteMany({}, err => {
    callback(err);
  });
}

function removeBlockedParams(callback) {
  DbBlockedParam.deleteMany({}, err => {
    callback(err);
  });
}

function removeNodePoweredStateValues(callback) {
  DbNodePoweredStateValue.deleteMany({}, err => {
    callback(err);
  });
}

function removeNodeSwitchedOnStateValues(callback) {
  DbNodeSwitchedOnStateValue.deleteMany({}, err => {
    callback(err);
  });
}
