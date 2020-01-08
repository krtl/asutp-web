const mongoose = require("mongoose");
const async = require("async");
const moment = require("moment");
const config = require("../../config");

const DbNodeStateValue = require("../dbmodels/nodeStateValue");

const start = moment();

async.series([open, getCounts], err => {
  // console.info(arguments);
  if (err) {
    console.info(`Failed! ${err}`);
  } else {
    const duration = moment().diff(start);
    console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
  }

  mongoose.disconnect();
  process.exit(err ? 1 : 0);
});

function open(callback) {
  console.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
}

function getCounts(callback) {
  DbNodeStateValue.aggregate(
    [
      // { $match: { nodeName: "ps1part110cc1" } },
      { $sort: { nodeName: 1, dt: -1 } },
      {
        $group: {
          _id: "$nodeName",
          dt: { $first: "$dt" },
          state: { $first: "$newState" }
        }
      }
    ],
    (err, values) => {
      if (err) {
        callback(err);
      } else {
        values.forEach(value => {
          console.info(value);
        });
        callback();
      }
    }
  );
}
