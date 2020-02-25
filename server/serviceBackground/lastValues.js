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
const DbBlockedParam = require("../dbmodels/blockedParam");

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
    dbValuesTracker.BlockParam(paramName);
  }
};

const UnblockRawValues = paramName => {
  const index = blockedParams.indexOf(paramName);
  if (index > -1) {
    blockedParams.splice(index, 1);
    dbValuesTracker.UnblockParam(paramName);
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

  if (
    process.env.NOWTESTING === undefined ||
    process.env.NOWTESTING === "test_values"
  ) {
    restoreLastParamValues(() => {
      restoreBlockedParamNamess(() => {
        dbValuesTracker.Start();
        callback();
      });
    });
  } else {
    callback();
  }
}

// function restoreLastParamValues(callback) {
//   const start = moment();
//   DbParamValue.aggregate(
//     [
//       { $sort: { paramName: 1, dt: -1 } },
//       {
//         $group: {
//           _id: "$paramName",
//           dt: { $first: "$dt" },
//           qd: { $first: "$qd" },
//           value: { $first: "$value" }
//         }
//       }
//     ],
//     (err, values) => {
//       if (err) {
//         logger.error(
//           `[!] [LastParamValues] Failed to get last value: "${err.message}".`
//         );
//         callback(err);
//       } else {
//         for (let i = 0; i < values.length; i += 1) {
//           const value = values[i];
//           const param = myDataModelNodes.GetParam(value._id);
//           if (param) {
//             const lastValue = new MyParamValue(
//               value._id,
//               value.value,
//               value.dt,
//               value.qd
//             );
//             lastValues.set(value._id, lastValue);
//             if (lastChanged.indexOf(value._id) < 0) {
//               lastChanged.push(value._id);
//             }
//             // console.debug("[]LastParamValue:", lastValue);
//           } else {
//             logger.warn(
//               `[ModelNodes][restoreLastParamValue] failed to find param: ${value._id}`
//             );
//           }
//         }

//         const duration = moment().diff(start);
//         logger.info(
//           `[LastParamValues] ${
//             lastValues.size
//           } LastParamValues loaded in ${moment(duration).format("mm:ss.SSS")}`
//         );

//         // eslint-disable-next-line no-console
//         console.debug(
//           `[LastParamValues] ${
//             lastValues.size
//           } LastParamValues loaded in ${moment(duration).format("mm:ss.SSS")}`
//         );

//         callback();
//       }
//     }
//   );
// }

function restoreLastParamValues(callback) {
  const start = moment();

  const params = myDataModelNodes.GetAllParamsAsArray();

  async.eachLimit(
    params,
    100,
    (param, callback) => {
      let locDbParamValue = null;
      if (param.trackAllChanges) {
        locDbParamValue = DbParamValue;
      } else if (param.trackAveragePerHour) {
        locDbParamValue = DbParamHalfHourValue;
      }

      if (locDbParamValue) {
        locDbParamValue.findOne(
          { paramName: param.name },
          null,
          { sort: { dt: "desc" } },
          (err, paramValue) => {
            if (err) {
              logger.error(
                `[lastValues] Failed to get last value: "${err.message}".`
              );
            } else if (paramValue) {
              const lastValue = new MyParamValue(
                paramValue.paramName,
                paramValue.value,
                paramValue.dt,
                paramValue.qd
              );
              lastValues.set(param.name, lastValue);
            } else {
              // temporary this way
              const now = moment()
                .minutes(0)
                .seconds(0)
                .milliseconds(0);
              const lastValue = new MyParamValue(param.name, 0, now, "NA");
              lastValues.set(param.name, lastValue);
            }

            callback(err);
          }
        );
      } else {
        callback();
      }
    },
    err => {
      if (err) {
        // setError(`Importing failed: ${err.message}`);
        logger.error(
          `[lastValues] ${lastValues.size} LastParamValues loaded wirh error: "${err.message}".`
        );
      } else {
        const duration = moment().diff(start);
        logger.info(
          `[lastValues] ${
            lastValues.size
          } LastParamValues loaded in ${moment(duration).format("mm:ss.SSS")}`
        );
      }

      callback(err);
    }
  );
}

function restoreBlockedParamNamess(callback) {
  const start = moment();
  let count = 0;
  blockedParams = [];

  DbBlockedParam.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) {
      logger.error(
        `[lastValues][restoreBlockedParamNames] failed. Error: "${err.message}".`
      );
      callback(err);
    } else {
      const duration1 = moment().diff(start);

      for (let i = 0; i < prms.length; i += 1) {
        const prm = prms[i];

        if (myDataModelNodes.GetParam(prm.name)) {
          blockedParams.push(prm.name);
          count += 1;
        } else {
          logger.warn(
            `[LastParamValues][RestoreBlockedParamNames] failed to find param: ${prm.name}`
          );
        }
      }

      logger.debug(
        `[LastParamValues] ${count} BlockedParams loaded in ${moment(
          duration1
        ).format("mm:ss.SSS")}`
      );

      // eslint-disable-next-line no-console
      console.debug(
        `[LastParamValues] ${count} BlockedParams loaded in ${moment(
          duration1
        ).format("mm:ss.SSS")}`
      );

      callback();
    }
  });
}

const SetManualValue = manualValue => {
  let errMess = "";

  // { paramName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }
  // { nodeName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

  if ("nodeName" in manualValue) {
    const node = myDataModelNodes.GetNode(manualValue.nodeName);
    if (
      node &&
      (node instanceof MyNodeConnector || node instanceof MyNodeSection)
    ) {
      node.SetManualValue(manualValue);
    } else {
      const s = `[lastValues][SetManualValue] "${manualValue.nodeName}" is not available node.`;
      logger.error(s);
      errMess += s;
    }
  } else if ("paramName" in manualValue) {
    if (process.env.NOWTESTING === undefined) {
      if (!myDataModelNodes.GetParam(manualValue.paramName)) {
        const s = `[lastValues][SetManualValue] Can't find param "${manualValue.paramName}".`;
        logger.error(s);
        errMess += s;
      }
    }

    if (errMess === "") {
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
    errMess += s;
  }

  if (errMess === "") {
    return;
  } else {
    return Error(errMess);
  }
};

function finalize() {
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
