const lastValues = new Map();

const SetLastValue = function (lastValue) {
  lastValues.set(lastValue.paramName, lastValue);

  console.log(lastValues.size);
};

const GetLastValue = function (paramName) {
  return lastValues.get(paramName);
};

module.exports.SetLastValue = SetLastValue;
module.exports.GetLastValue = GetLastValue;
