const mongoose = require("mongoose");
const async = require("async");
const moment = require("moment");
const config = require("../../config");

const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const DbParamValue = require("../dbmodels/paramValue");

const start = moment();

async.series(
  [
    open,
    testLastNodePoweredStates,
    testLastNodeSwitchedOnStates,
    // test2,
    testLastParamValues
  ],
  err => {
    // console.info(arguments);
    if (err) {
      console.info(`Failed! ${err}`);
    } else {
      const duration = moment().diff(start);
      console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
    }

    mongoose.disconnect();
    process.exit(err ? 1 : 0);
  }
);

function open(callback) {
  console.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
}

function testLastNodePoweredStates(callback) {
  DbNodePoweredStateValue.aggregate(
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

function testLastNodeSwitchedOnStates(callback) {
  DbNodeSwitchedOnStateValue.aggregate(
    [
      // { $match: { nodeName: "ps1part110cc1" } },
      { $sort: { connectorName: 1, dt: -1 } },
      {
        $group: {
          _id: "$connectorName",
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


function test2(callback) {
  (async () => {
    try {
      const lastNodeStates = await DbNodePoweredStateValue.aggregate([
        // { $match: { nodeName: "ps1part110cc1" } },
        { $sort: { nodeName: 1, dt: -1 } },
        {
          $group: {
            _id: "$nodeName",
            dt: { $first: "$dt" },
            state: { $first: "$newState" }
          }
        }
      ]); //.find().sort({dt: 'desc'}).lean().exec();

      lastNodeStates.forEach(value => {
        console.info(value);
      });
    } catch (err) {
      logger.warn(
        `[ModelNodes][restoreLastStateValues] failed. Error: "${err}".`
      );
      callback(err);
    }

    callback();
  })().catch(err=>callback(err));
}

function testLastParamValues(callback) {
  DbParamValue.aggregate(
    [
      // { $match: { nodeName: "ps1part110cc1" } },
      { $sort: { paramName: 1, dt: -1 } },
      {
        $group: {
          _id: "$paramName",
          dt: { $first: "$dt" },
          qd: { $first: "$qd" },
          state: { $first: "$value" }
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