const moment = require('moment');
const dbParamValue = require('../dbmodels/paramValue');
const dbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const logger = require('../logger');


const saveValue = (lastValue, callback) => {
  const paramValue = dbParamValue({
    paramName: lastValue.paramName,
    value: Math.round(lastValue.value * 1000) / 1000,
    dt: lastValue.dt,
    qd: lastValue.qd,
  });

  paramValue.save((err) => {
    if (err) {
      logger.error(`[dbValues] Failed to save value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

const saveHalfHourValue = (lastValue, callback) => {
  const paramValue = dbParamHalfHourValue({
    paramName: lastValue.paramName,
    value: Math.round(lastValue.value * 1000) / 1000,
    dt: lastValue.dt, // check minutes should be 00 or 30
    qd: lastValue.qd,
  });

  paramValue.save((err) => {
    if (err) {
      logger.error(`[dbValues] Failed to save half hour value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

const updateAverageHalfHourValue = (lastValue, callback) => {
  dbParamHalfHourValue.findOne({
    paramName: lastValue.paramName,
    dt: lastValue.dt,
  }, (err, paramValue) => {
    if (err) {
      logger.error(`[dbValues] Failed to get half hour value. Error: ${err}`);
      callback(err);
    } else if (paramValue) {
      let newValue = (paramValue.value + lastValue.value) / 2;
      newValue = Math.round(newValue * 1000) / 1000;
      dbParamHalfHourValue.update({ _id: paramValue.id }, { $set: { value: newValue } }, (err) => {
        if (err) {
          logger.error(`[dbValues] Failed to update half hour value. Error: ${err}`);
        }
        if (callback) {
          callback(err);
        }
      });
    } else {
      this.saveHalfHourValue(lastValue, callback);
    }
  });
};

const removeOldValues = (callback) => {
  const olderThan = moment().subtract(200, 'days');
  dbParamValue.deleteMany({ dt: { $lt: olderThan.toDate() } }, (err) => {
    if (err) {
      logger.error(`[dbValues] Failed to delete value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
  dbParamHalfHourValue.deleteMany({ dt: { $lt: olderThan.toDate() } }, (err) => {
    if (err) {
      logger.error(`[dbValues] Failed to delete value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

module.exports.saveValue = saveValue;
module.exports.saveHalfHourValue = saveHalfHourValue;
module.exports.updateAverageHalfHourValue = updateAverageHalfHourValue;
module.exports.removeOldValues = removeOldValues;
