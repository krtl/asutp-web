const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");
const async = require("async");
const config = require("../../config");

// process.env.LOGGER_NAME = "scriptDBParamsImport";
// process.env.LOGGER_LEVEL = "debug";
const logger = require("../logger_to_file");

const DbParam = require("../dbmodels/param");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbAsutpConnection = require("../dbmodels/asutpConnection");

const FileNames = ["asutpParams.json", "asutpConnections.json"];

let inserted = 0;
let updated = 0;

function Start(cb) {
  logger.info("script started.");

  const start = moment();
  async.series(
    [
      // open,
      // requireModels,
      importParams,
      importAsutpConnections
    ],
    err => {
      if (err) {
        console.error(`Importing params failed with ${err.message}`);
        logger.error(`Importing params failed with ${err.message}`);
      } else {
        const duration = moment().diff(start);
        console.info(
          `Importing params done in ${moment(duration).format("mm:ss.SSS")}`
        );
        logger.info(
          `Importing params done in ${moment(duration).format("mm:ss.SSS")}`
        );
      }
      // mongoose.disconnect();
      cb(err);
    }
  );
}

// function open(callback) {
//   console.log('open');
// // connect to the database and load dbmodels
//   require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

//   mongoose.connection.on('open', callback);
// }

// function requireModels(callback) {
//   console.log("models");
//   require("mongoose").model("Param"); // eslint-disable-line global-require
//   require("mongoose").model("NodeSchema"); // eslint-disable-line global-require
//   require("mongoose").model("AsutpConnection"); // eslint-disable-line global-require

//   async.each(
//     Object.keys(mongoose.models),
//     (modelName, callback) => {
//       mongoose.models[modelName].createIndexes(callback);
//     },
//     callback
//   );
// }

function importParams(callback) {
  console.info("importing params..");
  logger.info("importing params..");
  inserted = 0;
  updated = 0;

  const fileName = `${config.importPath}${FileNames[0]}`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file "${fileName}" does not exists`);
    console.info(err.message);
    logger.info(err.message);
    callback(err);
    return;
  }

  let rawdata;
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let params;
  try {
    params = JSON.parse(rawdata);
  } catch (e) {
    console.error(`JSON.parse Error: ${e.message}`);
    logger.error(`JSON.parse Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(
    params,
    (paramData, callback) => {
      const newParam = new DbParam(paramData);

      DbParam.findOne(
        {
          name: newParam.name
        },
        (err, param) => {
          if (err) callback(err);
          if (param) {
            // param exists

            if (
              param.caption !== newParam.caption ||
              param.description !== newParam.description
            ) {
              DbParam.updateOne(
                { _id: param.id },
                {
                  $set: {
                    caption: newParam.caption,
                    description: newParam.description
                  }
                },
                err => {
                  if (err) {
                    callback(err);
                  } else {
                    logger.info(`Param "${newParam.name}" updated`);
                    updated++;
                    callback(null);
                  }
                }
              );
            } else {
              callback(null);
            }
          } else {
            // param does not exist
            newParam.save(err => {
              if (err) callback(err);
              logger.info(`Param "${newParam.name}" inserted`);
              inserted++;
              callback(null);
            });
          }
        }
      );
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
        logger.error(`Failed: ${err.message}`);
      } else {
        console.log(`Success. Inserted: ${inserted} Updated: ${updated}`);
      }
      callback(err);
    }
  );
}

function importAsutpConnections(callback) {
  console.info("importing ASUTP Connections..");
  logger.info("importing ASUTP Connections..");
  inserted = 0;
  updated = 0;

  const fileName = `${config.importPath}${FileNames[1]}`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file "${fileName}" does not exists`);
    console.info(err.message);
    logger.info(err.message);
    callback(err);
    return;
  }

  let rawdata;
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let connections;
  try {
    connections = JSON.parse(rawdata);
  } catch (e) {
    console.error(`JSON.parse Error: ${e.message}`);
    logger.error(`JSON.parse Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(
    connections,
    (paramData, callback) => {
      const newConnection = new DbAsutpConnection(paramData);

      DbAsutpConnection.findOne(
        {
          name: newConnection.name
        },
        (err, asutpConnection) => {
          if (err) callback(err);
          if (asutpConnection) {
            if (
              asutpConnection.caption !== newConnection.caption ||
              asutpConnection.sapCode !== newConnection.sapCode ||
              asutpConnection.voltage !== newConnection.voltage ||
              asutpConnection.connectionNumber !==
                newConnection.connectionNumber ||
              asutpConnection.VVParamName !== newConnection.VVParamName ||
              asutpConnection.UlParamName !== newConnection.UlParamName ||
              asutpConnection.PParamName !== newConnection.PParamName
            ) {
              DbAsutpConnection.updateOne(
                { _id: asutpConnection.id },
                {
                  $set: {
                    caption: newConnection.caption,
                    sapCode: newConnection.sapCode,
                    voltage: newConnection.voltage,
                    connectionNumber: newConnection.connectionNumber,
                    VVParamName: newConnection.VVParamName,
                    PParamName: newConnection.PParamName,
                    UlParamName: newConnection.UlParamName
                  }
                },
                err => {
                  if (err) {
                    callback(err);
                  } else {
                    logger.info(
                      `asutpConnection "${newConnection.name}" updated`
                    );
                    updated++;
                    callback(null);
                  }
                }
              );
            } else {
              callback(null);
            }
          } else {
            newConnection.save(err => {
              if (err) callback(err);
              logger.info(`asutpConnection "${newConnection.name}" inserted`);
              inserted++;
              callback(null);
            });
          }
        }
      );
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
        logger.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success. Inserted: ${inserted} Updated: ${updated}`);
        logger.info(`Success. Inserted: ${inserted} Updated: ${updated}`);
      }
      callback(err);
    }
  );
}

module.exports.Start = Start;
