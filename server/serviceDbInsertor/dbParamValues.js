const moment = require("moment");
const dbParamValue = require("../dbmodels/paramValue");
const dbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");
const logger = require("../logger");

const SaveParamValue = (lastValue, callback) => {
  const paramValue = dbParamValue({
    paramName: lastValue.paramName,
    value: Math.round(lastValue.value * 1000) / 1000,
    dt: lastValue.dt,
    qd: lastValue.qd
  });

  logger.debug(
    `[dbParamValues] saving: ${paramValue.paramName} ${moment(
      paramValue.dt
    ).format("YYYY-MM-DD HH:mm:ss.SSS")} ${paramValue.value}`
  );
  paramValue.save(err => {
    if (err) {
      logger.error(
        `[dbParamValues] Failed to save value. Error: ${err.message}  ${lastValue}`
      );
    }
    if (callback) {
      callback(err);
    }
  });
};

const SaveHalfHourParamValue = (lastValue, callback) => {
  const paramValue = dbParamHalfHourValue({
    paramName: lastValue.paramName,
    value: Math.round(lastValue.value * 1000) / 1000,
    dt: lastValue.dt, // check minutes should be 00 or 30
    qd: lastValue.qd
  });

  paramValue.save(err => {
    if (err) {
      logger.error(
        `[dbParamValues] Failed to save half hour value. Error: ${err.message}`
      );
    }
    if (callback) {
      callback(err);
    }
  });
};

const UpdateAverageHalfHourParamValue = (lastValue, callback) => {
  dbParamHalfHourValue.findOne(
    {
      paramName: lastValue.paramName,
      dt: lastValue.dt
    },
    (err, paramValue) => {
      if (err) {
        logger.error(
          `[dbParamValues] Failed to get half hour value. Error: ${err.message}`
        );
        callback(err);
      } else if (paramValue) {
        let newValue = (paramValue.value + lastValue.value) / 2;
        newValue = Math.round(newValue * 1000) / 1000;
        dbParamHalfHourValue.updateOne(
          { _id: paramValue.id },
          { $set: { value: newValue } },
          err => {
            if (err) {
              logger.error(
                `[dbParamValues] Failed to update half hour value. Error: ${err.message}`
              );
            }
            if (callback) {
              callback(err);
            }
          }
        );
      } else {
        this.SaveHalfHourParamValue(lastValue, callback);
      }
    }
  );
};

const RemoveOldParamValues = callback => {
  const olderThan = moment().subtract(200, "days");
  dbParamValue.deleteMany({ dt: { $lt: olderThan.toDate() } }, err => {
    if (err) {
      logger.error(`[dbParamValues] Failed to delete value. Error: ${err.message}`);
    }
    if (callback) {
      callback(err);
    }
  });

  dbParamHalfHourValue.deleteMany({ dt: { $lt: olderThan.toDate() } }, err => {
    if (err) {
      logger.error(`[dbParamValues] Failed to delete value. Error: ${err.message}`);
    }
    if (callback) {
      callback(err);
    }
  });
};

const BlockDbParamValue = paramName => {
  DbBlockedParam.findOne({ name: paramName }, (err, param) => {
    if (err) {
      logger.error(`[BlockDbParam] Error: ${err.message}`);
    } else if (param) {
      logger.warn(`[BlockDbParam] param "${err.message}" already unblocked.`);
    } else {
      const paramValue = DbBlockedParam({
        name: paramName
      });

      paramValue.save(err => {
        if (err) {
          logger.error(`[BlockDbParam] Failed to save. Error: ${err.message}`);
        } else {
          logger.debug(`[dbParamValues] param "${paramName}" is blocked.`);
        }
      });
    }
  });
};

const UnblockDbParamValue = paramName => {
  DbBlockedParam.findOne({ name: paramName }, (err, param) => {
    if (err) {
      logger.error(`[UnblockDbParam] Error: ${err.message}`);
    } else if (param) {
      DbBlockedParam.deleteOne({ name: paramName }, err => {
        if (err) {
          logger.error(`[UnblockDbParam] Failed to delete. Error: ${err.message}`);
        } else {
          logger.debug(`[dbParamValues] param "${paramName}" is unblocked.`);
        }
      });
    } else {
      logger.warn(`[UnblockDbParam] param "${paramName}" already unblocked.`);
    }
  });
};

module.exports.SaveParamValue = SaveParamValue;
module.exports.SaveHalfHourParamValue = SaveHalfHourParamValue;
module.exports.UpdateAverageHalfHourParamValue = UpdateAverageHalfHourParamValue;
module.exports.RemoveOldParamValues = RemoveOldParamValues;
module.exports.BlockDbParamValue = BlockDbParamValue;
module.exports.UnblockDbParamValue = UnblockDbParamValue;
