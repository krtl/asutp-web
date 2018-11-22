const mongoose = require('mongoose');
const dbParam = require('../dbmodels/param');
const dbParamList = require('../dbmodels/paramList');
const dbParamValue = require('../dbmodels/paramValue');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  getParamListCount,
  getParamCount,
  getParamValueCount,
], (err) => {
  // console.info(arguments);
  if (err) {
    console.info(`Failed! ${err}`);
  } else {
    console.info('done.');
  }
  console.timeEnd('getCount');

  mongoose.disconnect();
  process.exit(err ? 1 : 0);
});

function open(callback) {
  console.info('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);

  console.time('getCount');
}

function getParamCount(callback) {
  dbParam.count({}, (err, count) => {
    if (err) {
      callback(err);
    } else {
      console.info(`dbParamCount=${count}`);
      callback(null);
    }
  });
}

function getParamListCount(callback) {
  dbParamList.count({}, (err, count) => {
    if (err) {
      callback(err);
    } else {
      console.info(`dbParamListCount=${count}`);
      callback(null);
    }
  });
}

function getParamValueCount(callback) {
  dbParamValue.count({}, (err, count) => {
    if (err) {
      callback(err);
    } else {
      console.info(`dbParamValueCount=${count}`);
      callback(null);
    }
  });
}
