function MyNodePoweredStateValue(nodeName, oldState, newState, dt) {
  this.nodeName = nodeName;
  this.oldState = oldState;
  this.newState = newState;
  this.dt = dt;
}

function myNodeStateStringifyReplacer(key, value) {
    // if (key === 'listNames') return undefined; // for future use
  return value;
}
const MyNodePoweredStateValueJsonSerialize = paramValue => JSON.stringify(paramValue, myNodeStateStringifyReplacer);

module.exports = MyNodePoweredStateValue;
module.exports.MyNodePoweredStateValueJsonSerialize = MyNodePoweredStateValueJsonSerialize;
