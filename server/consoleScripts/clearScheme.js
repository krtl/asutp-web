const mongoose = require('mongoose');
const netNodes = require('../dbmodels/netNode');
const netWires = require('../dbmodels/netWire');
const async = require('async');
const config = require('../../config');
const logger = require('../../server/logger');


async.series([
  open,
  removeNodes,
  removeWires,
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

function removeNodes(callback) {
  netNodes.remove({}, (err, obj) => {
    if (err) throw callback(err);
    logger.info(`Removed ${obj.result.n} records from NetNodes`);
    callback(null);
  });
}

function removeWires(callback) {
  netWires.remove({}, (err, obj) => {
    if (err) throw callback(err);
    logger.info(`Removed ${obj.result.n} records from NetWires`);
    callback(null);
  });
}
