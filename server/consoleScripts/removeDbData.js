const mongoose = require('mongoose');
// const dbParam = require('../dbmodels/param');
const dbParamValue = require('../dbmodels/paramValue');
const DbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const DbNodeStateValue = require('../dbmodels/nodeStateValue');

const async = require('async');
const config = require('../../config');


async.series([
  open,
  removeParamValueData,
  removeParamHalfHourValueData,
  removeNodeStateValues,
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

function removeNodeStateValues(callback) {
  DbNodeStateValue.remove({}, (err) => {
    if (err) throw callback(err);
    callback(null);
  });
}
