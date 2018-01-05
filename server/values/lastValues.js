// const logger = require('../logger');

const lastValues = new Map();
let lastChanged = [];

const setLastValue = (lastValue) => {
  lastValues.set(lastValue.paramName, lastValue);
  if (lastChanged.indexOf(lastValue.paramName) < 0) {
    lastChanged.push(lastValue.paramName);
  }
};

const getLastChanged = () => {
  const result = lastChanged.slice();
  lastChanged = [];
  return result;
};

const getLastValue = paramName => lastValues.get(paramName);

const getLastValuesCount = () => lastValues.size;

const clearLastValues = () => lastValues.clear();

module.exports.setLastValue = setLastValue;
module.exports.getLastValue = getLastValue;
module.exports.getLastChanged = getLastChanged;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.clearLastValues = clearLastValues;
