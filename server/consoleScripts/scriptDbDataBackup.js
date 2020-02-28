const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");

const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const DbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");

const async = require("async");
const config = require("../../config");

const models = [
  { model: DbParamValue, fileName: "ParamValues" },
  { model: DbParamHalfHourValue, fileName: "ParamHalfHourValues" },
  { model: DbBlockedParam, fileName: "BlockedParams" },
  { model: DbNodePoweredStateValue, fileName: "PoweredStateValue" },
  { model: DbNodeSwitchedOnStateValue, fileName: "SwitchedOnStateValues" }
];

Start = cb => {
  const start = moment();

  async.series(
    [openDBConnection, backupDataForList, closeDBConnection],
    err => {
      // console.info(arguments);
      if (err) {
        console.info(`Failed! ${err.message}`);
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

function backupDataForList(callback) {
  // events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(
    models,
    (element, callback) => {
      backupDataFor(element, callback);
    },
    err => {
      if (err) {
        console.Error(`Failed: ${err.message}`);
      } else {
        console.info("success.");
      }
      callback(err);
    }
  );
}

function backupDataFor(element, callback) {
  element.model
    .find({}, (err, linkages) => {
      if (err) {
        callback(err);
      } else {
        const fileName = `${config.exportPath}${
          element.fileName
        }${Date.now()}.json`;
        const json = JSON.stringify(linkages);
        fs.writeFile(fileName, json, "utf8", err => {
          console.info(`done: ${fileName}`);
          callback(err);
        });
      }
    })
    // .select("-_id");
    .select({ _id: 0, __v: 0 }); //exclude id and __v
}

Start();
