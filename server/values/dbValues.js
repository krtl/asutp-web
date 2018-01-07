const dbParamValue = require('../dbmodels/paramValue');


const saveLastValue = (lastValue, callback) => {
  const paramValue = dbParamValue({
    paramName: lastValue.paramName,
    value: lastValue.value,
    qd: lastValue.qd,
    dt: lastValue.dt,
  });

  paramValue.save((err) => {
    if (err) callback(err);
    callback(null);
  });
};

module.exports.saveLastValue = saveLastValue;
