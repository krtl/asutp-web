// process.argv.push("recreate");
process.argv.push("donotremoveoldnodes");

const mongoose = require("mongoose");
const async = require("async");
const moment = require("moment");
const config = require("../../config");
const creator = require("./scriptDBCreate");
const nodesImporter = require("./scriptDBImportNodes");
const paramsImporter = require("./scriptDBImportParams");
// const usersDataImporter = require("./scriptDBUsersDataImport");

const start = moment();

async.series(
  [
    openDBConnection,
    recreate,
    nodesImporter.Start,
    paramsImporter.Start,
    // usersDataImporter.Start,
    closeDBConnection
  ],
  err => {
    // console.log(arguments);

    const duration = moment().diff(start);
    console.log(`all done in ${moment(duration).format("mm:ss.SSS")}`);

    process.exit(err ? 255 : 0);
  }
);

function openDBConnection(callback) {
  console.log("open");

  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);

  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
}

function closeDBConnection(callback) {
  mongoose.connection.close();
  callback();
}

function recreate(callback) {
  if (process.argv.indexOf("recreate") >= 0) {
    creator.Start(callback);
  } else {
    callback();
  }
}
