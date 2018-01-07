const mongoose = require('mongoose');
const dbParam = require('../dbmodels/param');
const dbParamList = require('../dbmodels/paramList');
const dbParamValue = require('../dbmodels/paramValue');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  getParamCount,
  getParamListCount,
  getParamValueCount,
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

function getParamCount(callback) {
  dbParam.count({}, (err, count) => {
    if (err) throw callback(err);
    console.log(`dbParamCount=${count}`);
    callback(null);
  });
}

function getParamListCount(callback) {
  dbParamList.count({}, (err, count) => {
    if (err) throw callback(err);
    console.log(`dbParamListCount=${count}`);
    callback(null);
  });
}

function getParamValueCount(callback) {
  dbParamValue.count({}, (err, count) => {
    if (err) throw callback(err);
    console.log(`dbParamValueCount=${count}`);
    callback(null);
  });
}
