const moment = require('moment');
const DbNodeStateValue = require('../dbmodels/nodeStateValue');
const logger = require('../logger');


const SaveNodeStateValue = (stateValue, callback) => {
  const nodeStateValue = DbNodeStateValue({
    nodeName: stateValue.nodeName,
    oldValue: stateValue.oldValue,
    newValue: stateValue.newValue,
    dt: stateValue.dt,
  });

  nodeStateValue.save((err) => {
    if (err) {
      logger.error(`[dbNodeStateValues] Failed to save state value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

const RemoveOldNodeStateValues = (callback) => {
  const olderThan = moment().subtract(200, 'days');
  DbNodeStateValue.deleteMany({ dt: { $lt: olderThan.toDate() } }, (err) => {
    if (err) {
      logger.error(`[dbNodeStateValues] Failed to delete state value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

module.exports.SaveNodeStateValue = SaveNodeStateValue;
module.exports.RemoveOldNodeStateValues = RemoveOldNodeStateValues;
