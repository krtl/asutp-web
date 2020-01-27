const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");
const async = require("async");
const config = require("../../config");

const DbParam = require("../dbmodels/param");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbAsutpConnection = require("../dbmodels/asutpConnection");

const FileNames = ["asutpParams.json", "asutpConnections.json"];

function Start(cb) {
  const start = moment();
  async.series(
    [
      // open,
      // requireModels,
      importParams,
      importAsutpConnections
    ],
    err => {
      //  console.log(arguments);
      if (err) console.error("Failed!");

      if (err) {
        console.error(`Importing params failed with ${err.message}`);
      } else {
        const duration = moment().diff(start);
        console.log(
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
  console.log("importing params..");

  const fileName = `${config.importPath}${FileNames[0]}`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file "${fileName}" does not exists`);
    console.log(err.message);
    callback(err);
    return;
  }

  const rawdata = fs.readFileSync(fileName);
  const params = JSON.parse(rawdata);

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
                    console.log(`Param "${newParam.name}" updated`);
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
              console.log(`Param "${newParam.name}" inserted`);
              callback(null);
            });
          }
        }
      );
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
      } else {
        console.log("Success.");
      }
      callback(err);
    }
  );
}

function importAsutpConnections(callback) {
  console.log("importing ASUTP Connections..");

  const fileName = `${config.importPath}${FileNames[1]}`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file "${fileName}" does not exists`);
    console.log(err.message);
    callback(err);
    return;
  }

  const rawdata = fs.readFileSync(fileName);
  const connections = JSON.parse(rawdata);

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
                    console.log(
                      `asutpConnection "${newConnection.name}" updated`
                    );
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
              console.log(`asutpConnection "${newConnection.name}" inserted`);
              callback(null);
            });
          }
        }
      );
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
      } else {
        console.log("Success.");
      }
      callback(err);
    }
  );
}

module.exports.Start = Start;
