const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");

const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const DbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");

const DbUser = require("../dbmodels/authUser");

const async = require("async");
const config = require("../../config");

Start = cb => {
  const start = moment();

  async.series(
    [
      openDBConnection,
      exportLinkages,
      exportNodeSchemas,
      exportNodeCoordinates,
      closeDBConnection
    ],
    err => {
      // console.info(arguments);
      if (err) {
        console.info(`Failed! ${err}`);
      } else {
        const duration = moment().diff(start);
        console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
      }

      if (cb) cb(err);
      process.exit(err ? 1 : 0);
    }
  );
};

openDBConnection = callback => {
  console.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
};

closeDBConnection = callback => {
  mongoose.connection.close();
  callback();
};

exportLinkages = callback => {
  DbNodeParamLinkage.find({}, (err, linkages) => {
    if (err) {
      callback(err);
    } else {
      const fileName = `${config.exportPath}nodeParamLinkage${Date.now()}.json`;
      const json = JSON.stringify(linkages);
      fs.writeFile(fileName, json, "utf8", err => {
        console.info(`done: ${fileName}`);
        callback(err);
      });
    }
  }).select({ nodeName: 1, paramPropName: 1, paramPropValue: 1, _id: 0 });
};

exportNodeSchemas = callback => {
  DbNodeSchema.find({}, (err, linkages) => {
    if (err) {
      callback(err);
    } else {
      const fileName = `${config.exportPath}nodeSchemas${Date.now()}.json`;
      const json = JSON.stringify(linkages);
      fs.writeFile(fileName, json, "utf8", err => {
        console.info(`done: ${fileName}`);
        callback(err);
      });
    }
  }).select({
    name: 1,
    caption: 1,
    description: 1,
    nodeNames: 1,
    paramNames: 1,
    _id: 0
  });
};

exportNodeCoordinates = callback => {
  DbNodeCoordinates.find({}, (err, linkages) => {
    if (err) {
      callback(err);
    } else {
      const fileName = `${config.exportPath}nodeCoordinates${Date.now()}.json`;
      const json = JSON.stringify(linkages);
      fs.writeFile(fileName, json, "utf8", err => {
        console.info(`done: ${fileName}`);
        callback(err);
      });
    }
  }).select({ schemaName: 1, nodeName: 1, x: 1, y: 1, _id: 0 });
};

Start();