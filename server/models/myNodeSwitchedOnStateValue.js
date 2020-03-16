function MyNodeSwitchedOnStateValue(nodeName, oldState, newState, dt, user) {
  this.connectorName = nodeName;
  this.oldState = oldState;
  this.newState = newState;
  this.dt = dt;
  this.user = user;
}

function myNodeStateStringifyReplacer(key, value) {
  // if (key === 'listNames') return undefined; // for future use
  return value;
}
const MyNodeSwitchedOnStateValueJsonSerialize = paramValue =>
  JSON.stringify(paramValue, myNodeStateStringifyReplacer);

module.exports = MyNodeSwitchedOnStateValue;
module.exports.MyNodeSwitchedOnStateValueJsonSerialize = MyNodeSwitchedOnStateValueJsonSerialize;
