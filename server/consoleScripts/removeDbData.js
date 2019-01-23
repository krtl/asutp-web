const mongoose = require('mongoose');
// const dbParam = require('../dbmodels/param');
// const dbParamList = require('../dbmodels/paramList');
const dbParamValue = require('../dbmodels/paramValue');
const DbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const DbNodeState = require('../dbmodels/nodeState');

const async = require('async');
const config = require('../../config');


async.series([
  open,
  removeParamValueData,
  removeParamHalfHourValueData,
  removeNodeStates,
], (err) => {
//  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 1 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}


function removeParamValueData(callback) {
  dbParamValue.remove({}, (err) => {
    if (err) throw callback(err);
    callback(null);
  });
}

function removeParamHalfHourValueData(callback) {
  DbParamHalfHourValue.remove({}, (err) => {
    if (err) throw callback(err);
    callback(null);
  });
}

function removeNodeStates(callback) {
  DbNodeState.remove({}, (err) => {
    if (err) throw callback(err);
    callback(null);
  });
}
