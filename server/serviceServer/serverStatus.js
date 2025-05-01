const MyStompServer = require("./myStompServer");

function MyServerStatus() {
  this.clientsConnected = 0;
  this.collisionsCount = 0;
  this.avgRecalcTime = 0;
  this.maxRecalcTime = 0;
  this.clients = [];
}

let status = new MyServerStatus();
let changed = false;
let timerId;
let collisions = [];

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
  if (recalcStatus.collisionsCount !== undefined) {
    if (status.collisionsCount != recalcStatus.collisionsCount) {
      status.collisionsCount = recalcStatus.collisionsCount;
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

const addClient = client => {
  if (status.clients.indexOf(client) < 0) {
      status.clients.push(client);
      changed = true;
    }
};

const removeClient = client => {
  var idx = status.clients.indexOf(client);
  if (idx >= 0) {
      status.clients.splice(idx, 1);
      changed = true;
    }
};


const getServerStatus = () => {
  // console.debug("serverStatus:", status);
  return status;
};

const setCollisions = aCollisions => {
  collisions = aCollisions;
};

const getCollisions = () => {
  return collisions;
};

function myServerStatusStringifyReplacer(key, value) {
  // if (key === "collisions") return undefined;
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
module.exports.getServerStatus = getServerStatus;
module.exports.setCollisions = setCollisions;
module.exports.getCollisions = getCollisions;
module.exports.addClient = addClient;
module.exports.removeClient = removeClient;
