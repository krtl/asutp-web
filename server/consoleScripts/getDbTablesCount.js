const mongoose = require("mongoose");
const async = require("async");
const moment = require("moment");
const config = require("../../config");

const DbUser = require("../dbmodels/authUser");
const DbParam = require("../dbmodels/param");
const DbParamValue = require("../dbmodels/paramValue");
const DbParamHalfHourValue = require("../dbmodels/paramHalfHourValue");
const DbBlockedParam = require("../dbmodels/blockedParam");
const DbAsutpConnection = require("../dbmodels/asutpConnection");
const DbNode = require("../dbmodels/node");
const DbNodeRegion = require("../dbmodels/nodeRegion");
const DbNodeLEP = require("../dbmodels/nodeLEP");
const DbNodeLEP2LEPConnection = require("../dbmodels/nodeLEP2LEPConnection");
const DbNodeLEP2PSConnection = require("../dbmodels/nodeLEP2PSConnection");
const DbNodePS = require("../dbmodels/nodePS");
const DbNodeSec2SecConnector = require("../dbmodels/nodeSec2SecConnector");
const DbNodePSPart = require("../dbmodels/nodePSPart");
const DbNodeTransformer = require("../dbmodels/nodeTransformer");
const DbNodeTransformerConnector = require("../dbmodels/nodeTransformerConnector");
const DbNodeSection = require("../dbmodels/nodeSection");
const DbNodeSectionConnector = require("../dbmodels/nodeSectionConnector");
const DbNodeEquipment = require("../dbmodels/nodeEquipment");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");
const DbNodeSchema = require("../dbmodels/nodeSchema");

const Sheme = [
  DbUser,
  DbParam,
  DbParamValue,
  DbParamHalfHourValue,
  DbBlockedParam,
  DbAsutpConnection,
  DbNode,
  DbNodeRegion,
  DbNodeLEP,
  DbNodeLEP2LEPConnection,
  DbNodeLEP2PSConnection,
  DbNodePS,
  DbNodePSPart,
  DbNodeSec2SecConnector,
  DbNodeTransformer,
  DbNodeTransformerConnector,
  DbNodeSection,
  DbNodeSectionConnector,
  DbNodeEquipment,
  DbNodePoweredStateValue,
  DbNodeSwitchedOnStateValue,
  DbNodeParamLinkage,
  DbNodeCoordinates,
  DbNodeSchema
];

const start = moment();

async.series([open, getCounts], err => {
  // console.info(arguments);
  if (err) {
    console.info(`Failed! ${err.message}`);
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
  // events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(
    Sheme,
    (schemeElement, callback) => {
      getCountForTable(schemeElement, callback);
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

function getCountForTable(schemeElement, callback) {
  schemeElement.countDocuments({}, (err, count) => {
    if (err) {
      callback(err);
    } else {
      console.info(`${schemeElement.modelName}.Count = ${count}`);
      callback(null);
    }
  });
}
