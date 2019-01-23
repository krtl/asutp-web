const mongoose = require('mongoose');
const DbUser = require('../dbmodels/authUser');
const DbParam = require('../dbmodels/param');
const DbParamList = require('../dbmodels/paramList');
const DbParamValue = require('../dbmodels/paramValue');
const DbParamHalfHourValue = require('../dbmodels/paramHalfHourValue');
const DbAsutpConnection = require('../dbmodels/asutpConnection');
const DbNode = require('../dbmodels/node');
const DbNodeRegion = require('../dbmodels/nodeRegion');
const DbNodeLEP = require('../dbmodels/nodeLEP');
const DbNodeLEPConnection = require('../dbmodels/nodeLEPConnection');
const DbNodePS = require('../dbmodels/nodePS');
const DbNodeSec2SecConnector = require('../dbmodels/nodeSec2SecConnector');
const DbNodePSPart = require('../dbmodels/nodePSPart');
const DbNodeTransformer = require('../dbmodels/nodeTransformer');
const DbNodeTransformerConnector = require('../dbmodels/nodeTransformerConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeSectionConnector = require('../dbmodels/nodeSectionConnector');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');
const DbNodeState = require('../dbmodels/nodeState');

const async = require('async');
const config = require('../../config');

const Sheme = [
  DbUser,
  DbParam,
  DbParamList,
  DbParamValue,
  DbParamHalfHourValue,
  DbAsutpConnection,
  DbNode,
  DbNodeRegion,
  DbNodeLEP,
  DbNodeLEPConnection,
  DbNodePS,
  DbNodePSPart,
  DbNodeSec2SecConnector,
  DbNodeTransformer,
  DbNodeTransformerConnector,
  DbNodeSection,
  DbNodeSectionConnector,
  DbNodeEquipment,
  DbNodeState,
];


async.series([
  open,
  getCounts,
], (err) => {
  // console.info(arguments);
  if (err) {
    console.info(`Failed! ${err}`);
  } else {
    console.info('done.');
  }
  console.timeEnd('getCount');

  mongoose.disconnect();
  process.exit(err ? 1 : 0);
});

function open(callback) {
  console.info('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);

  console.time('getCount');
}

function getCounts(callback) {
  // events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(Sheme, (schemeElement, callback) => {
    getCountForTable(schemeElement, callback);
  }, (err) => {
    if (err) {
      console.Error(`Failed: ${err}`);
    } else {
      console.info('success.');
    }
    callback(err);
  });
}

function getCountForTable(schemeElement, callback) {
  schemeElement.count({}, (err, count) => {
    if (err) {
      callback(err);
    } else {
      console.info(`${schemeElement.modelName}.Count = ${count}`);
      callback(null);
    }
  });
}
