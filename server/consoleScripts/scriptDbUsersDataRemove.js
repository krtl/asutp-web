const mongoose = require("mongoose");

const DbUser = require("../dbmodels/authUser");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");

const async = require("async");
const config = require("../../config");

const models = [DbUser, DbNodeParamLinkage, DbNodeCoordinates, DbNodeSchema];

async.series([openDBConnection, removeDataForList, closeDBConnection], err => {
  //  console.log(arguments);
  mongoose.disconnect();

  if (err) console.error(err);
  console.log("done");

  process.exit(err ? 1 : 0);
});

function openDBConnection(callback) {
  console.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
}

function closeDBConnection(callback) {
  mongoose.connection.close();
  callback();
}

function removeDataForList(callback) {
  // events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(
    models,
    (element, callback) => {
      removeDataFor(element, callback);
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

function removeDataFor(element, callback) {
  element.deleteMany({}, err => {
    callback(err);
  });
}
