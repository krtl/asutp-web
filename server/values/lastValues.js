const logger = require('../logger');

const lastValues = new Map();

const setLastValue = function (lastValue) {
  lastValues.set(lastValue.paramName, lastValue);
};

const getLastValue = function (paramName) {
  return lastValues.get(paramName);
};

const getLastValuesCount = function () {
  return lastValues.size;
};

const clearLastValues = function () {
  return lastValues.clear();
};

module.exports.setLastValue = setLastValue;
module.exports.getLastValue = getLastValue;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.clearLastValues = clearLastValues;
