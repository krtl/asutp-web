const mongoose = require('mongoose');
const dbParam = require('../dbmodels/param');
const dbParamList = require('../dbmodels/paramList');
const dbParamValue = require('../dbmodels/paramValue');
const async = require('async');
const config = require('../../config');
const logger = require('../../server/logger');


async.series([
  open,
  getParamCount,
  getParamListCount,
  getParamValueCount,
], (err) => {
//  logger.info(arguments);
  mongoose.disconnect();
  process.exit(err ? 1 : 0);
});

function open(callback) {
  logger.info('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}

function getParamCount(callback) {
  dbParam.count({}, (err, count) => {
    if (err) throw callback(err);
    logger.info(`dbParamCount=${count}`);
    callback(null);
  });
}

function getParamListCount(callback) {
  dbParamList.count({}, (err, count) => {
    if (err) throw callback(err);
    logger.info(`dbParamListCount=${count}`);
    callback(null);
  });
}

function getParamValueCount(callback) {
  dbParamValue.count({}, (err, count) => {
    if (err) throw callback(err);
    logger.info(`dbParamValueCount=${count}`);
    callback(null);
  });
}
