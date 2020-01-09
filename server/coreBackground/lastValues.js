const async = require("async");
const moment = require("moment");
const fs = require("fs");
const logger = require("../logger");
const config = require("../../config");

const dbValuesTracker = require("./amqpInsertValueSender");
const myDataModelNodes = require("../models/myDataModelNodes");
const MyNodeConnector = require("../models/myNodeConnector");
const MyNodeSection = require("../models/myNodeSection");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbParamValue = require("../dbmodels/paramValue");
const MyParamValue = require("../models/myParamValue");

// const logger = require('../logger');

const lastValues = new Map();
let lastChanged = [];
let blockedParams = [];
let useDbValueTracker = false;

const setValue = newValue => {
  // removing duplicates
  const lastValue = lastValues.get(newValue.paramName);
  if (
    !lastValue ||
    lastValue.value !== newValue.value ||
    lastValue.dt !== newValue.dt ||
    lastValue.qd !== newValue.qd
  ) {
    if (useDbValueTracker) {
      dbValuesTracker.TrackDbParamValue(newValue);
    }

    lastValues.set(newValue.paramName, newValue);
    if (lastChanged.indexOf(newValue.paramName) < 0) {
      lastChanged.push(newValue.paramName);
    }
  }
};

const setRawValue = newValue => {
  if (blockedParams.indexOf(newValue.paramName) < 0) {
    setValue(newValue);
  }
};

const BlockRawValues = paramName => {
  if (blockedParams.indexOf(paramName) < 0) {
    blockedParams.push(paramName);
  }
};

const UnblockRawValues = paramName => {
  const index = blockedParams.indexOf(paramName);
  if (index > -1) {
    blockedParams.splice(index, 1);
  }
};

const getLastChanged = () => {
  const result = lastChanged.slice();
  lastChanged = [];
  return result;
};

const getLastValue = paramName => lastValues.get(paramName);

const getLastValuesCount = () => lastValues.size;

const ClearLastValues = () => lastValues.clear();

function init(obj, callback) {
  if (obj.useDbValueTracker) {
    useDbValueTracker = obj.useDbValueTracker;
  }

  if (process.env.NOWTESTING) {
    callback();
  } else {
    restoreLastParamValues(() => {
      // restoreBlockedParamNamess(() => {
      dbValuesTracker.Start();
      callback();
      // });
    });
  }
}

function restoreLastParamValues(callback) {
  // callback();

  const start = moment();

  // DbParamHalfHourValue

  DbParamValue.aggregate(
    [
      // { $match: { nodeName: "ps1part110cc1" } },
      { $sort: { paramName: 1, dt: -1 } },
      {
        $group: {
          _id: "$paramName",
          dt: { $first: "$dt" },
          qd: { $first: "$qd" },
          value: { $first: "$value" }
        }
      }
    ],
    (err, values) => {
      if (err) {
        logger.error(`[LastParamValues] Failed to get last value: "${err}".`);
        callback(err);
      } else {
        for (let i = 0; i < values.length; i += 1) {
          const value = values[i];
          const param = myDataModelNodes.GetParam(value._id);
          if (param) {
            const lastValue = new MyParamValue(
              value._id,
              value.value,
              value.dt,
              value.qd
            );
            lastValues.set(value._id, lastValue);
            if (lastChanged.indexOf(value._id) < 0) {
              lastChanged.push(value._id);
            }
            // console.debug("[]LastParamValue:", lastValue);
          } else {
            logger.warn(
              `[ModelNodes][restoreLastParamValue] failed to find param: ${value._id}`
            );
          }
        }

        const duration = moment().diff(start);
        logger.info(
          `[LastParamValues] ${
            lastValues.size
          } LastParamValues loaded in ${moment(duration).format("mm:ss.SSS")}`
        );

        // eslint-disable-next-line no-console
        console.debug(
          `[LastParamValues] ${
            lastValues.size
          } LastParamValues loaded in ${moment(duration).format("mm:ss.SSS")}`
        );

        callback();
      }
    }
  );
}

function storeBlockedParamNames() {
  const start = moment();
  const data = JSON.stringify(blockedParams);
  const duration1 = moment().diff(start);
  try {
    fs.writeFileSync(`${config.storePath}blockedParams.json`, data);
  } catch (err) {
    logger.error(`[lastValues] saving blockedParams error: ${err}`);
    return;
  }
  const duration2 = moment().diff(start);
  logger.debug(
    `[lastValues] blockedParams prepared in ${moment(duration1).format(
      "mm:ss.SSS"
    )} and saved in  ${moment(duration2).format("mm:ss.SSS")}`
  );
}

function restoreBlockedParamNamess(callback) {
  const start = moment();
  let count = 0;
  blockedParams = [];
  const fileName = `${config.storePath}blockedParams.json`;

  if (
    !fs.exists(fileName, exists => {
      if (!exists) {
        const err = `file "${fileName}" does not exists`;
        logger.warn(
          `[lastValues][restoreBlockedParamNames] failed. File "${fileName}" is not found.`
        );
        callback(err);
        return;
      }
      fs.readFile(fileName, (err, data) => {
        if (err) {
          callback(err);
          return;
        }

        let paramNames;
        try {
          paramNames = JSON.parse(data);
        } catch (e) {
          logger.error(
            `[lastValues][restoreBlockedParamNames] failed. Error: "${e.message}". File "${fileName}" `
          );
          callback(err);
          return;
        }
        const duration1 = moment().diff(start);

        for (let i = 0; i < paramNames.length; i += 1) {
          const paramName = paramNames[i];

          if (myDataModelNodes.GetParam(paramName)) {
            blockedParams.push(paramName);
            count += 1;
          } else {
            logger.warn(
              `[][RestoreBlockedParamNames] failed to find param: ${paramName}`
            );
          }
        }

        const duration2 = moment().diff(start);
        logger.debug(
          `[] ${count} BlockedParams loaded in ${moment(duration2).format(
            "mm:ss.SSS"
          )} (file loaded and parsed in ${moment(duration1).format(
            "mm:ss.SSS"
          )})`
        );
        callback();
      });
    })
  );
}

const SetManualValue = manualValue => {
  let err = "";

  // { paramName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }
  // { nodeName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

  if ("nodeName" in manualValue) {
    const node = myDataModelNodes.GetNode(manualValue.nodeName);
    if (node instanceof MyNodeConnector || node instanceof MyNodeSection) {
      node.SetManualValue(manualValue);
    } else {
      const s = `[lastValues][SetManualValue] "${manualValue.nodeName}" is not available node.`;
      logger.error(s);
      err += s;
    }
  } else if ("paramName" in manualValue) {
    if (process.env.NOWTESTING === undefined) {
      if (!myDataModelNodes.GetParam(manualValue.paramName)) {
        const s = `[lastValues][SetManualValue] Can't find param "${manualValue.paramName}".`;
        logger.error(s);
        err += s;
      }
    }

    if (err === "") {
      if (manualValue.cmd === "block") {
        BlockRawValues(manualValue.paramName);
      } else if (manualValue.cmd === "unblock") {
        UnblockRawValues(manualValue.paramName);
      }

      if (manualValue.manualValue !== undefined) {
        const momentDT = moment();
        const dt = new Date(momentDT);
        // const float = parseFloat(manualValue.manualValue.replace(',', '.'));
        const float = manualValue.manualValue;
        let qd = "Z";
        if (blockedParams.indexOf(manualValue.paramName) > 0) {
          qd += ",B";
        }
        const obj = new MyParamValue(manualValue.paramName, float, dt, qd);
        setValue(obj);
      }
    }
  } else {
    const s = `[lastValues][SetManualValue] Unknown command: "${manualValue}".`;
    logger.error(s);
    err += s;
  }

  if (err === "") {
    return;
  } else {
    return Error(err);
  }
};

function finalize() {
  // storeBlockedParamNames();
  dbValuesTracker.Stop();
}

module.exports.init = init;
module.exports.setRawValue = setRawValue;
module.exports.SetManualValue = SetManualValue;
module.exports.BlockRawValues = BlockRawValues;
module.exports.UnblockRawValues = UnblockRawValues;
module.exports.getLastValue = getLastValue;
module.exports.getLastChanged = getLastChanged;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.ClearLastValues = ClearLastValues;
module.exports.finalize = finalize;
