const mongoose = require("mongoose");
const fs = require("fs");
const async = require("async");
const config = require("../../config");

// process.env.LOGGER_NAME = "scriptDBCreate";
// process.env.LOGGER_LEVEL = "debug";
const logger = require("../logger_to_file");

const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const DbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");

function Start(cb) {
  async.series(
    [
      // open,
      dropDatabase,
      requireModels,
      createUsers
    ],
    err => {
      // console.log(arguments);
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

function dropDatabase(callback) {
  console.info("drop");
  logger.info("drop");
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  console.log("requiring models");
  logger.info("requiring models");
  require("mongoose").model("AuthUser"); // eslint-disable-line global-require
  require("mongoose").model("Param"); // eslint-disable-line global-require
  require("mongoose").model("ParamValue"); // eslint-disable-line global-require
  require("mongoose").model("ParamHalfHourValue"); // eslint-disable-line global-require

  require("mongoose").model("AsutpConnection"); // eslint-disable-line global-require

  // require("mongoose").model("NetNode"); // eslint-disable-line global-require
  // require("mongoose").model("NetWire"); // eslint-disable-line global-require

  require("mongoose").model("Node"); // eslint-disable-line global-require
  require("mongoose").model("NodeRegion"); // eslint-disable-line global-require
  require("mongoose").model("NodeLEP"); // eslint-disable-line global-require
  require("mongoose").model("NodeLEP2PSConnection"); // eslint-disable-line global-require
  require("mongoose").model("NodeLEP2LEPConnection"); // eslint-disable-line global-require
  require("mongoose").model("NodePS"); // eslint-disable-line global-require
  require("mongoose").model("NodePSPart"); // eslint-disable-line global-require
  require("mongoose").model("NodeTransformer"); // eslint-disable-line global-require
  require("mongoose").model("NodeTransformerConnector"); // eslint-disable-line global-require
  require("mongoose").model("NodeSection"); // eslint-disable-line global-require
  require("mongoose").model("NodeSectionConnector"); // eslint-disable-line global-require
  require("mongoose").model("NodeSec2SecConnector"); // eslint-disable-line global-require
  require("mongoose").model("NodeEquipment"); // eslint-disable-line global-require

  require("mongoose").model("NodeParamLinkage"); // eslint-disable-line global-require

  require("mongoose").model("NodeSchema"); // eslint-disable-line global-require
  require("mongoose").model("NodeSwitchedOnStateValue"); // eslint-disable-line global-require
  require("mongoose").model("NodePoweredStateValue"); // eslint-disable-line global-require
  require("mongoose").model("NodeCoordinates"); // eslint-disable-line global-require

  async.each(
    Object.keys(mongoose.models),
    (modelName, callback) => {
      mongoose.models[modelName].createIndexes(callback);
    },
    callback
  );
}

function createUsers(callback) {
  // should be redone!

  console.info("creating users");
  logger.info("creating users");
  
  const fileName = `${config.importPath}users.json`;
  let rawdata = "";
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    return;
  }

  const users = JSON.parse(rawdata);

  async.eachLimit(
    users, 100,
    (userData, callback) => {
      const user = new mongoose.models.AuthUser(userData);
      user.save(err => {
        if (err) callback(`Exception on save User: ${err.message}`);
        console.log(`User "${user.email}" inserted`);
        callback(null);
      });
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
        logger.error(`Failed: ${err.message}`);
      } else {
        console.log("Success.");
        logger.info("Success.");
      }
      callback(err);
    }
  );
}

module.exports.Start = Start;
