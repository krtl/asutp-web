const moment = require('moment');
const dbParamValue = require('../dbmodels/paramValue');
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

const updateAverageValue = (lastValue, callback) => {
  dbParamValue.findOne({
    paramName: lastValue.paramName,
    dt: lastValue.dt,
  }, (err, paramValue) => {
    if (err) {
      logger.error(`[dbValues] Failed to get value. Error: ${err}`);
      callback(err);
    } else if (paramValue) {
      let newValue = (paramValue.value + lastValue.value) / 2;
      newValue = Math.round(newValue * 1000) / 1000;
      dbParamValue.update({ _id: paramValue.id }, { $set: { value: newValue } }, (err) => {
        if (err) {
          logger.error(`[dbValues] Failed to update value. Error: ${err}`);
        }
        if (callback) {
          callback(err);
        }
      });
    } else {
      this.saveValue(lastValue, callback);
    }
  });
};

const removeOldValues = (callback) => {
  const olderThan = moment().subtract(200, 'days');
  dbParamValue.deleteMany({ dt: { $lt: olderThan.toDate() } }, (err) => {
    if (err) {
      logger.error(`[dbValues] Failed to save value. Error: ${err}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

module.exports.saveValue = saveValue;
module.exports.updateAverageValue = updateAverageValue;
module.exports.removeOldValues = removeOldValues;
