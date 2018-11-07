const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const events = require('events');
const config = require('../../config');
const myNodeType = require('../models/myNodeType');

const DbNode = require('../dbmodels/node');
const DbNodeRES = require('../dbmodels/nodeRES');
const DbNodeLEP = require('../dbmodels/nodeLEP');
const DbNodeLEPConnection = require('../dbmodels/nodeLEPConnection');
const DbNodePS = require('../dbmodels/nodePS');
const DbNodePSPart = require('../dbmodels/nodePSPart');
const DbNodeTransformer = require('../dbmodels/nodeTransformer');
const DbNodeTransformerConnector = require('../dbmodels/nodeTransformerConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeSectionConnector = require('../dbmodels/nodeSectionConnector');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');

const Sheme = [
  [ DbNodeRES, 'nodeRESs.json' ],
  [ DbNodeLEP, 'nodeLEPs.json' ],
  [ DbNodeLEPConnection, 'nodeLEP2PSConnections.json' ],
  [ DbNodePS, 'nodePSs.json' ],
  [ DbNodePSPart, 'nodePSParts.json' ],
  [ DbNodeTransformer, 'nodeTransformers.json' ],
  [ DbNodeTransformerConnector, 'nodeTransformerConnectors.json' ],
  [ DbNodeSection, 'nodeSections.json' ],
  [ DbNodeSectionConnector, 'nodeSectionConnectors.json' ],
  [ DbNodeEquipment, 'nodeEquipments.json' ],
];

let errs = 0;
function setError(text) {
  errs += 1;
  console.error(text);
}
let updateStarted = 0;  // for debugging
let updated = 0;        // for debugging
let processed = 0;      // for debugging


async.series([
  open,
  requireModels,
  preparingNodes,
  importNodes,
  checkIntegrity,
  removingOldNodes,
], (err) => {
//  console.info(arguments);
  mongoose.disconnect();

  if (errs === 0) {
    console.info('Script successed.');
  } else {
    console.error(`Script failed with ${errs} errors!`);
  }

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
      y: newNode.y,
      tag: 1,
    } }, callback);
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
      setError(`updateNodeObj error: Property ${pName} is not degined.`);
      // break;
    }
  }

  DbNodeObj.update({ _id: originNode.id },
    { $set: obj }, callback);
}

function preparingNodes(callback) {
  DbNode.updateMany({ },
    { $set: {
      tag: 0 },
    }, (err, res) => {
      if (err) {
        console.warn(`[!] ${err}`);
      } else {
        console.debug(`[debug] ${res.nModified} updated.`);
      }
      callback(err);
    });
}

function updateNodeTag(originNode, callback) {
  updateStarted += 1;
  DbNode.updateOne({ _id: originNode.id },
    { $set: {
      tag: 1 },
    }, (err, res) => {
      if (err) {
        console.warn(`[!] ${err}`);
      } else if (res.nModified === 0) {
        console.warn('[!] did not updated.');
      } else {
        updated += 1;
      }

      callback(err);
    });
}

function removingOldNodes(callback) {
  console.debug(`[debug] processed = ${processed} updateStarted = ${updateStarted} updated = ${updated}`);

  DbNode.find({
    tag: 0,
  }, (err, netNodes) => {
    let s = '';
    netNodes.forEach((netNode) => {
      if (s.length < 500) s += `${netNode.name},`;
    });
    if (s !== '') {
      console.warn(`[!] there are ${netNodes.length} old nodes: ${s} that will be deleted.`);

      DbNode.deleteMany({ tag: 0 }, (err, res) => {
        if (err) {
          console.warn(`[!] ${err}`);
        } else {
          console.warn(`[!] ${res} old nodes were deleted.`);
        }
      });
    }
    callback();
  });
}

function importNodes(callback) {
  events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(Sheme, (schemeElement, callback) => {
    importNodesFromFile(schemeElement, callback);
  }, (err) => {
    if (err) {
      setError(`Importing failed: ${err}`);
    } else {
      console.info('Importing successed.');
    }
    callback(err);
  }, (err) => {
    callback(err);
  });
}

function checkIfParentNodeExists(node, callback) {
  if ((node.parentNode === undefined) || (node.parentNode === null) || (node.parentNode === '')) {
    if (myNodeType.isParentRequired(node.nodeType)) {
      const s = `Parent is required for node:"${node.name}"!`;
      setError(s);
      callback(s);
    } else {
      callback(null);
    }
  } else {
    DbNode.findOne({
      name: node.parentNode,
    }, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists
        callback(null);
      } else {
        // node does not exist
        const s = `Parent node "${node.parentNode}" does not exists for node:"${node.name}"!`;
        setError(s);
        callback(s);
      }
    });
  }
}

let DbNodeObj = null;   // don't know how to pass into async.series function as parameters
let newNode = null;     // don't know how to pass into async.series function as parameters
let newNodeObj = null;  // don't know how to pass into async.series function as parameters

function processNode(processNodeCallback) {
  getNode(newNode.name, (err, netNode) => {
    if (err) processNodeCallback(err);
    if (netNode) {
        // node exists

      if (!isTheSameNode(netNode, newNode)) {
        updateNode(netNode, newNode, (error) => {
          if (error) processNodeCallback(error);
          console.info(`Node "${newNode.name}" updated`);
          checkIfParentNodeExists(newNode, processNodeCallback);
        });
      } else {
        updateNodeTag(netNode, (error) => {
          if (error) processNodeCallback(error);
          checkIfParentNodeExists(newNode, processNodeCallback);
        });
      }
    } else {
        // does not exist
      newNode.save((err) => {
        if (err) {
          processNodeCallback(err);
        }
        console.info(`Node "${newNode.name}" inserted`);
        checkIfParentNodeExists(newNode, processNodeCallback);
      });
    }
  });
}

function processNodeObj(processNodeObjCallback) {
  getNodeObj(DbNodeObj, newNode.name, (err, existedNodeObj) => {
    if (err) processNodeObjCallback(err);
    if (existedNodeObj) {
          // node exists

      if (!isTheSameNodeObj(DbNodeObj, existedNodeObj, newNodeObj)) {
        updateNodeObj(DbNodeObj, existedNodeObj, newNodeObj, (error) => {
          if (error) processNodeObjCallback(error);
          console.info(`NodeObj "${newNode.name}" updated`);
          processNodeObjCallback(null);
        });
      } else {
        processNodeObjCallback(null);
      }
    } else {
              // does not exist
      newNodeObj.save((err) => {
        if (err) {
          processNodeObjCallback(err);
        }
        console.info(`NodeObj "${newNode.name}" inserted`);
        processNodeObjCallback(null);
      });
    }
  });
}

function processNodeSeries(callback) {
  async.series([
    processNode,
    processNodeObj,
  ], (err) => {
    if (err) {
      setError(err);
    }
    callback(err);
  });
}

function importNodesFromFile(schemeElement, callback) {
  DbNodeObj = schemeElement[0];
  const fileName = schemeElement[1];
  const fullFileName = `${config.importPath}${fileName}`;
  console.info(`importing from "${fullFileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fullFileName);
  } catch (err) {
    setError(`Read file error: ${err.message}`);
    callback(err.message);
    return;
  }

  const locObjects = JSON.parse(rawdata);

  async.eachSeries(locObjects, (locData, callback) => {
    newNode = new DbNode(locData);
    newNodeObj = new DbNodeObj(locData);
    newNode.nodeType = DbNodeObj.nodeType;
    newNode.tag = 1;
    processed += 1;
    processNodeSeries(callback);
  }, (err) => {
    if (err === null) {
      console.info('importing from file successed.');
    }
    callback(err);
  });
}

function checkIntegrity(callback) {
  console.info('Checking integrity..');
  DbNode.find({
    parentNode: null,
    nodeType: myNodeType.getParentRequiresTypes(),
  }, null, { sort: { name: 1 } }, (err, netNodes) => {
    if (err) {
      setError(`Checking integrity failed: ${err}`);
      callback(err);
    } else if (netNodes.length > 0) {
      let s = '';
      let locCount = 0;
      for (let i = 0; i < netNodes.length; i += 1) {
        if (myNodeType.parentRequired(netNodes[i].nodeType)) {
          s += netNodes[i].name;
          locCount += 1;
          if (i < (netNodes.length) - 1) s += ',';
          if (s.length > 100) break;
        }
      }
      if (locCount > 0) {
        setError(`Checking integrity is failed: There are ${locCount} nodes without parent: ${s}`);
        callback(s);
      } else {
        console.info('Checking Successed.');
        callback(null);
      }
    } else {
      console.info('Checking Successed.');
      callback(null);
    }
  });
}
