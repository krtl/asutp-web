const moment = require("moment");
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const logger = require("../logger");

const SaveNodePoweredStateValue = (stateValue, callback) => {
  const nodeStateValue = DbNodePoweredStateValue({
    nodeName: stateValue.nodeName,
    oldState: stateValue.oldState,
    newState: stateValue.newState,
    dt: stateValue.dt
  });

  nodeStateValue.save(err => {
    if (err) {
      logger.error(
        `[dbNodePoweredStateValues] Failed to save Powered State value. Error: ${err}`
      );
    } else {
      logger.debug(
        `[dbNodePoweredStateValue] saved: ${stateValue.nodeName} ${stateValue.newState}`
      );
    }

    if (callback) {
      callback(err);
    }
  });
};

const SaveNodeSwitchedOnStateValue = (stateValue, callback) => {
  const nodeStateValue = DbNodeSwitchedOnStateValue({
    connectorName: stateValue.connectorName,
    oldState: stateValue.oldState,
    newState: stateValue.newState,
    dt: stateValue.dt
  });

  nodeStateValue.save(err => {
    if (err) {
      logger.error(
        `[dbNodeSwitchedOnStateValues] Failed to save SwitchedOn State value. Error: ${err}`
      );
    } else {
      logger.debug(
        `[dbNodeSwitchedOnStateValue] saved: ${stateValue.connectorName} ${stateValue.newState}`
      );
    }

    if (callback) {
      callback(err);
    }
  });
};

const RemoveOldNodePoweredStateValues = callback => {
  const olderThan = moment().subtract(300, "days");

  // should not we lost LastValues??

  DbNodePoweredStateValue.deleteMany(
    { dt: { $lt: olderThan.toDate() } },
    err => {
      if (err) {
        logger.error(
          `[dbNodePoweredStateValues] Failed to delete state value. Error: ${err}`
        );
      }
      if (callback) {
        callback(err);
      }
    }
  );
};

const RemoveOldNodeSwitchedOnStateValues = callback => {
  const olderThan = moment().subtract(300, "days");

  // should not we lost LastValues??

  DbNodeSwitchedOnStateValue.deleteMany(
    { dt: { $lt: olderThan.toDate() } },
    err => {
      if (err) {
        logger.error(
          `[dbNodeSwitchedOnStateValues] Failed to delete state value. Error: ${err}`
        );
      }
      if (callback) {
        callback(err);
      }
    }
  );
};

module.exports.SavePoweredNodeStateValue = SaveNodePoweredStateValue;
module.exports.SaveSwitchedOnNodeStateValue = SaveNodeSwitchedOnStateValue;
module.exports.RemoveOldNodePoweredStateValues = RemoveOldNodePoweredStateValues;
module.exports.RemoveOldNodeSwitchedOnStateValues = RemoveOldNodeSwitchedOnStateValues;
