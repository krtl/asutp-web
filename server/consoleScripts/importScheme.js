const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const events = require('events');
const config = require('../../config');
// const console = require('../../server/console');

const DbNode = require('../dbmodels/netNode');
const DbNodeRES = require('../dbmodels/nodeRES');
const DbNodeLEP = require('../dbmodels/nodeLEP');
const DbNodePS = require('../dbmodels/nodePS');
const DbNodePSPart = require('../dbmodels/nodePSPart');
const DbNodeTransformer = require('../dbmodels/nodeTransformer');
const DbNodeConnector = require('../dbmodels/nodeConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');


const Sheme = [
  [ DbNodeRES, 'nodeRESs.json' ],
  [ DbNodeLEP, 'nodeLEPs.json' ],
  [ DbNodePS, 'nodePSs.json' ],
  [ DbNodePSPart, 'nodePSParts.json' ],
  [ DbNodeTransformer, 'nodeTransformers.json' ],
  [ DbNodeSection, 'nodeSections.json' ],
  [ DbNodeConnector, 'nodeConnectors.json' ],
  [ DbNodeEquipment, 'nodeEquipments.json' ],
];

async.series([
  open,
  requireModels,
  importNodes,
], (err) => {
//  console.info(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.info('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}

function requireModels(callback) {
  console.info('models');

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function getNode(nodeName, callback) {
  DbNode.findOne({
    name: nodeName,
  }, (err, netNode) => {
    callback(err, netNode);
  });
}

function getNodeObj(DbNodeObj, nodeName, callback) {
  DbNodeObj.findOne({
    name: nodeName,
  }, (err, netNode) => {
    callback(err, netNode);
  });
}

function isTheSameNode(netNode1, netNode2) {
  return ((netNode1.caption === netNode2.caption) &&
    (netNode1.description === netNode2.description) &&
    (netNode1.x === netNode2.x) &&
    (netNode1.y === netNode2.y));
}

function isTheSameNodeObj(DbNodeObj, netNode1, netNode2) {
  let result = true;
  for (let i = 0; i < DbNodeObj.compareProps.length; i += 1) {
    const pName = DbNodeObj.compareProps[i];
    const hasProperty1 = pName in netNode1;
    const hasProperty2 = pName in netNode2;

    if ((hasProperty1) && (hasProperty2)) {
      if (netNode1[pName] !== netNode2[pName]) {
        result = false;
        break;
      }
    } else {
      result = false;
      break;
    }
  }
  return result;
}

function updateNode(originNode, newNode, callback) {
  DbNode.update({ _id: originNode.id },
    { $set: {
      caption: newNode.caption,
      description: newNode.description,
      x: newNode.x,
      y: newNode.y } }, callback);
}

function defineAProp(obj, name, value) {
  Object.defineProperty(obj, name, {
    value,
    enumerable: true,
  });
}

function updateNodeObj(DbNodeObj, originNode, newNode, callback) {
  const obj = {};
  for (let i = 0; i < DbNodeObj.compareProps.length; i += 1) {
    const pName = DbNodeObj.compareProps[i];
    const hasProperty1 = pName in originNode;
    const hasProperty2 = pName in newNode;

    if ((hasProperty1) && (hasProperty2)) {
      if (originNode[pName] !== newNode[pName]) {
        defineAProp(obj, pName, newNode[pName]);
      }
    } else {
      console.error(`updateNodeObj error: Property ${pName} is not degined.`);
      // break;
    }
  }

  DbNodeObj.update({ _id: originNode.id },
    { $set: obj }, callback);
}

function importNodes(callback) {
  events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(Sheme, (schemeElement, callback) => {
    importNodesFromFile(schemeElement, callback);
  }, (err) => {
    if (err) {
      console.error(`Importing failed: ${err}`);
    } else {
      console.info('Importing successed.');
    }
    callback(err);
  }, (err) => {
    callback(err);
  });
}

function importNodesFromFile(schemeElement, callback) {
  const DbNodeObj = schemeElement[0];
  const fileName = schemeElement[1];
  const fullFileName = `${config.importPath}${fileName}`;
  console.info(`importing from "${fullFileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fullFileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    callback(err.message);
    return;
  }

  const locObjects = JSON.parse(rawdata);

  async.each(locObjects, (locData, callback) => {
    const newNode = new DbNode(locData);
    const newNodeObj = new DbNodeObj(locData);

    getNode(newNode.name, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        if (!isTheSameNode(netNode, newNode)) {
          updateNode(netNode, newNode, (error) => {
            if (error) callback(error);
            console.info(`Node "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
        // does not exist
        newNode.save((err) => {
          if (err) {
            callback(err);
          }
          console.info(`Node "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });

    getNodeObj(DbNodeObj, newNode.name, (err, existedNodeObj) => {
      if (err) callback(err);
      if (existedNodeObj) {
            // node exists

        if (!isTheSameNodeObj(DbNodeObj, existedNodeObj, newNodeObj)) {
          updateNodeObj(DbNodeObj, existedNodeObj, newNodeObj, (error) => {
            if (error) callback(error);
            console.info(`Node "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
                // does not exist
        newNodeObj.save((err) => {
          if (err) {
            callback(err);
          }
          console.info(`Node "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.info('Success.');
    }
    callback(err);
  });
}
