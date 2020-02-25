const lastParamValues = new Map();

const setValue = newValue => {
  // removing duplicates
  const lastValue = lastParamValues.get(newValue.paramName);
  if (
    !lastValue ||
    lastValue.value !== newValue.value ||
    lastValue.dt !== newValue.dt ||
    lastValue.qd !== newValue.qd
  ) {
    lastParamValues.set(newValue.paramName, newValue);
  }
};

const getLastValue = paramName => lastParamValues.get(paramName);


module.exports.setValue = setValue;
module.exports.getLastValue = getLastValue;
