const mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const moment = require("moment");
const config = require("../../config");

process.env.LOGGER_NAME = "scriptDBUsersDataImport";
process.env.LOGGER_LEVEL = "debug";
const logger = require("../logger_to_file");

const DbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");

const models = [
  { model: DbParamValue, fileName: "ParamValues" },
  { model: DbParamHalfHourValue, fileName: "ParamHalfHourValues" },
  { model: DbBlockedParam, fileName: "BlockedParams" },
  { model: DbNodePoweredStateValue, fileName: "PoweredStateValue" },
  { model: DbNodeSwitchedOnStateValue, fileName: "SwitchedOnStateValues" }
];

let warns = 0;
setWarn = text => {
  warns += 1;
  console.warn(`[!] ${text}`);
  logger.warn(`[!] ${text}`);
};

Start = cb => {
  logger.info("script started.");
  const start = moment();
  async.series(
    [openDBConnection, restoreDataForList, closeDBConnection],
    err => {
      // console.info(arguments);
      if (err) {
        console.error(`Failed! ${err.message}`);
        logger.error(`Failed! ${err.message}`);
      } else if (warns === 0) {
        const duration = moment().diff(start);
        console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
        logger.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
      } else {
        console.info(`done. warns ${warns}`);
        logger.info(`done. warns ${warns}`);
      }

      if (cb) cb(err);
    }
  );
};

openDBConnection = callback => {
  logger.info("open");

  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
};

closeDBConnection = callback => {
  mongoose.connection.close();
  callback();
};


function restoreDataForList(callback) {
  // events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(
    models,
    (element, callback) => {
      restoreDataFor(element, callback);
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
      } else {
        console.info("success.");
      }
      callback(err);
    }
  );
}

function restoreDataFor(element, callback) {
  let rawdata = null;
  const fileName = `${config.importPath}${element.fileName}.json`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file not exists: "${fileName}"`);
    console.info(err.message);
    logger.info(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let rawElements;
  try {
    rawElements = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create linkage Error: ${e.message}`);
    logger.error(`create linkage Error: ${e.message}`);
    callback(e);
    return;
  }

  async.eachLimit(
    rawElements,
    100,
    (rawElementData, callback) => {
      switch (element.model) {
        case DbParamValue: {
          restoreParamValues(element.model, rawElementData, err => {
            callback(err);
          });
          break;
        }
        case DbParamHalfHourValue: {
          restoreHalfHourParamValues(element.model, rawElementData, err => {
            callback(err);
          });
          break;
        }
        case DbBlockedParam: {
          restoreBlockerdParams(element.model, rawElementData, err => {
            callback(err);
          });
          break;
        }
        case DbNodePoweredStateValue: {
          restoreNodePoweredState(element.model, rawElementData, err => {
            callback(err);
          });
          break;
        }
        case DbNodeSwitchedOnStateValue: {
          restoreNodeSwitchdOnState(element.model, rawElementData, err => {
            callback(err);
          });
          break;
        }
        default: {
          callback("Unknown model.");
        }
      }
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
        logger.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
        logger.info(`Success: ${fileName}`);
      }
      callback(err);
    }
  );
}

function restoreParamValues(model, rawElementData, callback) {
  const newElement = new model(rawElementData);
  model.findOne(
    {
      paramName: rawElementData.paramName
    },
    (err, dbRecord) => {
      if (err) {
        callback(err);
      } else if (dbRecord) {
        if (
          rawElementData.value !== dbRecord.value ||
          rawElementData.dt !== dbRecord.dt ||
          rawElementData.qd !== dbRecord.qd
        ) {
          model.updateOne(
            { _id: dbRecord.id },
            {
              $set: {
                value: dbRecord.value,
                dt: dbRecord.dt,
                qd: dbRecord.qd
              }
            },
            err => {
              if (err) {
                callback(err);
              } else {
                logger.info(`ParamValue "${dbRecord.paramName}" updated`);
                callback(null);
              }
            }
          );
        } else {
          callback(null);
        }
      } else {
        newElement.save(err => {
          if (err) {
            callback(`Exception on save ParamValue: ${err.message}`);
          } else {
            logger.info(
              `ParamValue "${rawElementData.paramName}" inserted`
            );
            callback(null);
          }
        });
      }
    }
  );
}

function restoreHalfHourParamValues(model, rawElementData, callback) {
  const newElement = new model(rawElementData);
  model.findOne(
    {
      paramName: rawElementData.paramName
    },
    (err, dbRecord) => {
      if (err) {
        callback(err);
      } else if (dbRecord) {
        if (
          rawElementData.value !== dbRecord.value ||
          rawElementData.dt !== dbRecord.dt ||
          rawElementData.qd !== dbRecord.qd
        ) {
          model.updateOne(
            { _id: dbRecord.id },
            {
              $set: {
                value: dbRecord.value,
                dt: dbRecord.dt,
                qd: dbRecord.qd
              }
            },
            err => {
              if (err) {
                callback(err);
              } else {
                logger.info(`HalfHourParamValue "${dbRecord.paramName}" updated`);
                callback(null);
              }
            }
          );
        } else {
          callback(null);
        }
      } else {
        newElement.save(err => {
          if (err) {
            callback(`Exception on save HalfHourParamValue: ${err.message}`);
          } else {
            logger.info(
              `HalfHourParamValue "${rawElementData.paramName}" inserted`
            );
            callback(null);
          }
        });
      }
    }
  );
}

function restoreBlockerdParams(model, rawElementData, callback) {
  const newElement = new model(rawElementData);
  model.findOne(
    {
      name: rawElementData.name
    },
    (err, dbRecord) => {
      if (err) {
        callback(err);
      } else if (dbRecord) {
        if (
          rawElementData.dt !== dbRecord.dt
        ) {
          model.updateOne(
            { _id: dbRecord.id },
            {
              $set: {
                dt: dbRecord.dt
              }
            },
            err => {
              if (err) {
                callback(err);
              } else {
                logger.info(`BlockedParam "${dbRecord.name}" updated`);
                callback(null);
              }
            }
          );
        } else {
          callback(null);
        }
      } else {
        newElement.save(err => {
          if (err) {
            callback(`Exception on save BlockedParam: ${err.message}`);
          } else {
            logger.info(
              `BlockedParam "${rawElementData.name}" inserted`
            );
            callback(null);
          }
        });
      }
    }
  );
}

function restoreNodePoweredState(model, rawElementData, callback) {
  const newElement = new model(rawElementData);
  model.findOne(
    {
      nodeName: rawElementData.nodeName
    },
    (err, dbRecord) => {
      if (err) {
        callback(err);
      } else if (dbRecord) {
        if (
          rawElementData.oldState !== dbRecord.oldState ||
          rawElementData.newState !== dbRecord.newState ||
          rawElementData.dt !== dbRecord.dt
        ) {
          model.updateOne(
            { _id: dbRecord.id },
            {
              $set: {
                oldState: dbRecord.oldState,
                newState: dbRecord.newState,
                dt: dbRecord.dt
              }
            },
            err => {
              if (err) {
                callback(err);
              } else {
                logger.info(`NodePoweredState "${dbRecord.nodeName}" updated`);
                callback(null);
              }
            }
          );
        } else {
          callback(null);
        }
      } else {
        newElement.save(err => {
          if (err) {
            callback(`Exception on save NodePoweredState: ${err.message}`);
          } else {
            logger.info(
              `NodePoweredState "${rawElementData.nodeName}" inserted`
            );
            callback(null);
          }
        });
      }
    }
  );
}

function restoreNodeSwitchdOnState(model, rawElementData, callback) {
  const newElement = new model(rawElementData);
  model.findOne(
    {
      connectorName: rawElementData.connectorName
    },
    (err, dbRecord) => {
      if (err) {
        callback(err);
      } else if (dbRecord) {
        if (
          rawElementData.oldState !== dbRecord.oldState ||
          rawElementData.newState !== dbRecord.newState ||
          rawElementData.dt !== dbRecord.dt
        ) {
          model.updateOne(
            { _id: dbRecord.id },
            {
              $set: {
                oldState: dbRecord.oldState,
                newState: dbRecord.newState,
                dt: dbRecord.dt
              }
            },
            err => {
              if (err) {
                callback(err);
              } else {
                logger.info(`ParamValue "${dbRecord.connectorName}" updated`);
                callback(null);
              }
            }
          );
        } else {
          callback(null);
        }
      } else {
        newElement.save(err => {
          if (err) {
            callback(`Exception on save ParamValue: ${err.message}`);
          } else {
            logger.info(
              `ParamValue "${rawElementData.connectorName}" inserted`
            );
            callback(null);
          }
        });
      }
    }
  );
}

module.exports.Start = Start;

Start();
