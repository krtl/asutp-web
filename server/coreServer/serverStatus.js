const MyStompServer = require("../coreServer/myStompServer");

function MyServerStatus() {
  this.clientsConnected = 0;
  this.collisions = 0;
  this.avgRecalcTime = 0;
  this.maxRecalcTime = 0;
}

let status = new MyServerStatus();
let changed = false;
let timerId;

const initialize = () => {
  if (process.env.NOWTESTING === undefined) {
    timerId = setInterval(() => {
      if (changed) {
        changed = false;
        // console.debug("serverStatus:", status);
        MyStompServer.sendServerStatus(status);
      }
    }, 3000);
    console.log("[] ServerStatus initialized.");
  }
};

const finalize = () => {
  if (process.env.NOWTESTING === undefined) {
    clearInterval(timerId);
    console.log("[] ServerStatus finalized.");
  }
};

const setRecalculationStatus = recalcStatus => {
  if (recalcStatus.collisions !== undefined) {
    if (status.collisions != recalcStatus.collisions) {
      status.collisions = recalcStatus.collisions;
      changed = true;
    }
  }
  if (recalcStatus.avgRecalcTime !== undefined) {
    if (status.avgRecalcTime != recalcStatus.avgRecalcTime) {
      status.avgRecalcTime = recalcStatus.avgRecalcTime;
      changed = true;
    }
  }
  if (recalcStatus.maxRecalcTime !== undefined) {
    if (status.maxRecalcTime != recalcStatus.maxRecalcTime) {
      status.maxRecalcTime = recalcStatus.maxRecalcTime;
      changed = true;
    }
  }
};

const setWSocketStatus = wsocketStatus => {
  if (wsocketStatus.clientsConnected !== undefined) {
    if (status.clientsConnected != wsocketStatus.clientsConnected) {
      status.clientsConnected = wsocketStatus.clientsConnected;
      changed = true;
    }
  }
};

const isStatusChanged = () => {
  return changed;
};

const getServerStatus = () => {
  // console.debug("serverStatus:", status);
  return status;
};

function myServerStatusStringifyReplacer(key, value) {
  // if (key === 'listNames') return undefined; // for future use
  return value;
}
const MyServerStatusJsonSerialize = value =>
  JSON.stringify(value, myServerStatusStringifyReplacer);

module.exports = MyServerStatus;
module.exports.MyServerStatusJsonSerialize = MyServerStatusJsonSerialize;
module.exports.initialize = initialize;
module.exports.finalize = finalize;
module.exports.setRecalculationStatus = setRecalculationStatus;
module.exports.setWSocketStatus = setWSocketStatus;
module.exports.isStatusChanged = isStatusChanged;
module.exports.getServerStatus = getServerStatus;
