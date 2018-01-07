const dbParamValue = require('../dbmodels/paramValue');
const logger = require('../logger');


const saveLastValue = (lastValue) => {
  const paramValue = dbParamValue({
    paramName: lastValue.paramName,
    value: lastValue.value,
    qd: lastValue.qd,
    dt: lastValue.dt,
  });

  paramValue.save((err) => {
    if (err) {
      logger.error(`[dbValues] Failed to save last value. Error: ${err}`);
    }
  });
};

module.exports.saveLastValue = saveLastValue;
