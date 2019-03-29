const async = require('async');
const logger = require('../logger');
const moment = require('moment');
const fs = require('fs');
const config = require('../../config');

const dbValuesTracker = require('./amqpInsertValueSender');
const myDataModelNodes = require('../models/myDataModelNodes');
const MyNodeConnector = require('../models/myNodeConnector');
const DbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const DbParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');


// const logger = require('../logger');

const lastValues = new Map();
let lastChanged = [];
let blockedParams = [];
let useDbValueTracker = false;

const setValue = (newValue) => {
  // removing duplicates
  const lastValue = lastValues.get(newValue.paramName);
  if ((!lastValue) || (lastValue.value !== newValue.value) || (lastValue.dt !== newValue.dt) || (lastValue.qd !== newValue.qd)) {
    if (useDbValueTracker) {
      dbValuesTracker.TrackDbParamValue(newValue);
    }

    lastValues.set(newValue.paramName, newValue);
    if (lastChanged.indexOf(newValue.paramName) < 0) {
      lastChanged.push(newValue.paramName);
    }
  }
};

const setRawValue = (newValue) => {
  if (blockedParams.indexOf(newValue.paramName) < 0) {
    setValue(newValue);
  }
};

const BlockRawValues = (paramName) => {
  if (blockedParams.indexOf(paramName) < 0) {
    blockedParams.push(paramName);
  }
};

const UnblockRawValues = (paramName) => {
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

  restoreLastParamValues(() => {
    restoreBlockedParams(() => {
      dbValuesTracker.Start();
      callback();
    });
  });
}

function restoreLastParamValues(callback) {
  // callback();

  const start = moment();

  const params = myDataModelNodes.GetAllParamsAsArray();

  // events.EventEmitter.defaultMaxListeners = 125;
  async.each(params, (param, callback) => {
    DbParamValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
      if (err) {
        logger.error(`[LastParamValues] Failed to get last value: "${err}".`);
        callback(err);
      } else if (paramValue) {
        const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
        lastValues.set(param.name, lastValue);
        callback(err);
      } else {
        DbParamHalfHourValue.findOne({ paramName: param.name }, null, { sort: { dt: 'desc' } }, (err, paramValue) => {
          if (err) {
            logger.error(`[LastParamValues] Failed to get last halfhour value: "${err}".`);
            callback(err);
          } else if (paramValue) {
            const lastValue = new MyParamValue(paramValue.paramName, paramValue.value, paramValue.dt, paramValue.qd);
            lastValues.set(param.name, lastValue);
            callback(err);
          } else {
            // none
            callback(err);
          }
        });
      }
    });
  }, (err) => {
    if (err) {
      // setError(`Importing failed: ${err}`);
      logger.error(`[LastParamValues] ${lastValues.size} LastParamValues loaded with error: "${err}".`);
    } else {
      // console.info('Importing successed.');
      const duration = moment().diff(start);
      logger.info(`[LastParamValues] ${lastValues.size} LastParamValues loaded in ${moment(duration).format('mm:ss.SSS')}`);
    }

    callback(err);
  });
}


function StoreBlockedParams() {
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
  logger.debug(`[lastValues] blockedParams prepared in ${moment(duration1).format('mm:ss.SSS')} and saved in  ${moment(duration2).format('mm:ss.SSS')}`);
}

function restoreBlockedParams(callback) {
  const start = moment();
  let count = 0;
  blockedParams = [];
  const fileName = `${config.storePath}blockedParams.json`;

  if (!fs.exists(fileName, (exists) => {
    if (!exists) {
      const err = `file "${fileName}" does not exists`;
      logger.warn(`[lastValues][blockedParams] failed. File "${fileName}" is not found.`);
      callback(err);
      return;
    }
    fs.readFile(fileName, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      const paramNames = JSON.parse(data);
      const duration1 = moment().diff(start);

      for (let i = 0; i < paramNames.length; i += 1) {
        const paramName = paramNames[i];

        if (myDataModelNodes.GetParam(paramName)) {
          blockedParams.push(paramName);
          count += 1;
        } else {
          logger.warn(`[][RestoreBlockedParams] failed to find param: ${paramName}`);
        }
      }

      const duration2 = moment().diff(start);
      logger.debug(`[] ${count} BlockedParams loaded in ${moment(duration2).format('mm:ss.SSS')} (file loaded and parsed in ${moment(duration1).format('mm:ss.SSS')})`);
      callback();
    });
  }));
}


const SetManualValue = (manualValue) => {
  let err = '';

  // { paramName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }
  // { connectorName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

  if ('connectorName' in manualValue) {
    const connector = myDataModelNodes.GetNode(manualValue.connectorName);
    if (connector instanceof MyNodeConnector) {
      connector.SetManualValue(manualValue);
    } else {
      const s = `[lastValues][SetManualValue] "${manualValue.connectorName}" is not connector.`;
      logger.error(s);
      err += s;
    }
  } else if ('paramName' in manualValue) {
    if (myDataModelNodes.GetParam(manualValue.paramName)) {
      if (manualValue.cmd === 'block') {
        BlockRawValues(manualValue.paramName);
      } else if (manualValue.cmd === 'unblock') {
        UnblockRawValues(manualValue.paramName);
      }

      if (manualValue.manualValue !== undefined) {
        const momentDT = moment();
        const dt = new Date(momentDT);
        // const float = parseFloat(manualValue.manualValue.replace(',', '.'));
        const float = manualValue.manualValue;
        let qd = 'Z';
        if (blockedParams.indexOf(manualValue.paramName) > 0) {
          qd += ',B';
        }
        const obj = new MyParamValue(manualValue.paramName, float, dt, qd);
        setValue(obj);
      }
    } else {
      const s = `[lastValues][SetManualValue] Can't find param "${manualValue.paramName}".`;
      logger.error(s);
      err += s;
    }
  } else {
    const s = `[lastValues][SetManualValue] Unknown command: "${manualValue}".`;
    logger.error(s);
    err += s;
  }

  return err;
};


module.exports.init = init;
module.exports.setRawValue = setRawValue;
module.exports.SetManualValue = SetManualValue;
module.exports.BlockRawValues = BlockRawValues;
module.exports.UnblockRawValues = UnblockRawValues;
module.exports.getLastValue = getLastValue;
module.exports.getLastChanged = getLastChanged;
module.exports.getLastValuesCount = getLastValuesCount;
module.exports.ClearLastValues = ClearLastValues;
module.exports.StoreBlockedParams = StoreBlockedParams;
