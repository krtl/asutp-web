const dbValuesTracker = require('./amqpInsertValueSender');
const nodeStateValuesTracker = require('./nodeStateValuesTracker');

// const logger = require('../logger');

const lastValues = new Map();
let lastChanged = [];
let useDbValueTracker = false;
let useNodeStateValueTracker = true;

const setLastValue = (lastValue) => {
  if (useDbValueTracker) {
    dbValuesTracker.trackDbParamValue(lastValue);
  }

  if (useNodeStateValueTracker) {
    nodeStateValuesTracker.trackNodeStateValue(lastValue);
  }

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

function init(obj) {
  if (obj.useDbValueTracker) {
    useDbValueTracker = obj.useDbValueTracker;
  }
  if (obj.useNodeStateValueTracker) {
    useNodeStateValueTracker = obj.useNodeStateValueTracker;
  }
}

module.exports.init = init;
module.exports.setLastValue = setLastValue;
module.exports.getLastValue = getLastValue;
module.exports.getLastChanged = getLastChanged;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.clearLastValues = clearLastValues;
