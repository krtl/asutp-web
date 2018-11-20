function MyParamValue(paramName, value, dt, qd) {
  this.paramName = paramName;
  this.value = value;
  this.dt = dt;
  this.qd = qd;
}

function myParamStringifyReplacer(key, value) {
  // if (key === 'listNames') return undefined; // for future use
  return value;
}
const MyParamValueJsonSerialize = paramValue => JSON.stringify(paramValue, myParamStringifyReplacer);

module.exports = MyParamValue;
module.exports.MyParamValueJsonSerialize = MyParamValueJsonSerialize;
