const async = require('async');
const events = require('events');

const myNodeType = require('./myNodeType');

const DbNode = require('../dbmodels/node');
const DbNodeRES = require('../dbmodels/nodeRES');
const DbNodeLEP = require('../dbmodels/nodeLEP');
const DbNodeLEPConnection = require('../dbmodels/nodeLEPConnection');
const DbNodePS = require('../dbmodels/nodePS');
const DbNodePSPart = require('../dbmodels/nodePSPart');
const DbNodeTransformer = require('../dbmodels/nodeTransformer');
const DbNodeConnector = require('../dbmodels/nodeConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');

const logger = require('../logger');

// const MyNode = require('./myNode');
const MyNodeRES = require('./myNodeRES');
const MyNodeLEP = require('./myNodeLEP');
const MyNodeLEPConnection = require('./myNodeLEPConnection');
const MyNodePS = require('./myNodePS');
const MyNodePSPart = require('./myNodePSPart');
const MyNodeTransformer = require('./myNodeTransformer');
const MyNodeSection = require('./myNodeSection');
const MyNodeConnector = require('./myNodeConnector');
const MyNodeEquipment = require('./myNodeEquipment');

const nodes = new Map();
const RESs = new Map();
const LEPs = new Map();
const PSs = new Map();

const Sheme = [
  [ DbNodeRES, MyNodeRES ],
  [ DbNodeLEP, MyNodeLEP ],
  [ DbNodeLEPConnection, MyNodeLEPConnection ],
  [ DbNodePS, MyNodePS ],
  [ DbNodePSPart, MyNodePSPart ],
  [ DbNodeTransformer, MyNodeTransformer ],
  [ DbNodeSection, MyNodeSection ],
  [ DbNodeConnector, MyNodeConnector ],
  [ DbNodeEquipment, MyNodeEquipment ],
];


let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(text);
}

process
  .on('unhandledRejection', (reason, p) => {
    setError(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', (err) => {
    setError(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

const LoadFromDB = (cb) => {
  errs = 0;
  async.series([
    clearData,
    loadNodes,
    linkData,
    checkData,
  ], () => {
    let res = null;
    if (errs === 0) {
      logger.info(`[sever] loaded from DB with ${nodes.size} Nodes: LEPs=${LEPs.size}, RESs=${RESs.size}, PSs=${PSs.size}`);
    } else {
      res = `[sever] loading nodes failed with ${errs} errors!`;
      logger.error(res);
    }
    return cb(res);
  });
};

function clearData(cb) {
  nodes.clear();

  return cb();
}

function loadNodes(callback) {
  events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(Sheme, (schemeElement, callback) => {
    loadNodesFromDB(schemeElement, callback);
  }, (err) => {
    if (err) {
      setError(`loading failed: ${err}`);
    } else {
      //
    }
    callback(err);
  }, (err) => {
    callback(err);
  });
}

function loadNodesFromDB(schemeElement, cb) {
  const DbNodeObj = schemeElement[0];
  const MyNodeObj = schemeElement[1];
  DbNodeObj.find({}, null, { sort: { name: 1 } }, (err, objcts) => {
    if (err) return cb(err);
    async.each(objcts, (dbNodeObj, callback) => {
      DbNode.findOne({
        name: dbNodeObj.name,
      }, (err, locNode) => {
        if (err) {
          callback(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeObj(
            locNode.name,
            locNode.caption,
            locNode.description);
          p.parentNode = locParentNode;

          const props = DbNodeObj.compareProps;
          props.forEach((pName) => {
            const hasProperty = pName in p;
            if (hasProperty) {
              p[pName] = dbNodeObj[pName];
            } else {
              setError(`Node Ojbect "${dbNodeObj.name}" has no property "${pName}"!`);
            }
          });

          switch (DbNodeObj.nodeType) {
            case myNodeType.RES: { RESs.set(locNode.name, p); break; }
            case myNodeType.LEP: { LEPs.set(locNode.name, p); break; }
            case myNodeType.PS: { PSs.set(locNode.name, p); break; }
            default: // nodes.set(locNode.name, p);
          }
          nodes.set(locNode.name, p);
          callback(null);
        } else {
          // node does not exist
          const s = `create NodeRES Error: DBNode "${dbNodeObj.name}" does not exists!`;
          logger.error(s);
          callback(s);
        }
        return false;
      });
      return false;
    }, (err) => {
      cb(err);
    });
    return false;
  });
}

function linkTransformer(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PS) {
      node.parentNode.transformers.push(node);
    } else if (node.parentNode.nodeType === myNodeType.PSPART) {
      if (node.parentNode.parentNode.nodeType === myNodeType.PS) {
        node.parentNode.parentNode.transformers.push(node);
        node.parentNode.transformers.push(node);
      } else {
        setError(`Failed to link transformer ${node.name}. Owner PS is not found.`);
      }
    } else {
      setError(`Failed to link transformer. There is no parent for ${node.name}`);
    }
  }
}

function linkSection(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PS) {
      node.parentNode.sections.push(node);
    } else if (node.parentNode.nodeType === myNodeType.PSPART) {
      if (node.parentNode.parentNode.nodeType === myNodeType.PS) {
        node.parentNode.parentNode.sections.push(node);
        node.parentNode.transformers.push(node);
      } else {
        setError(`Failed to link section ${node.name}. Owner PS is not found.`);
      }
    } else {
      setError(`Failed to link section. There is no parent for ${node.name}`);
    }
  }
}

function linkData(cb) {
  nodes.forEach((locNode) => {
    if (locNode.parentNode) {
      locNode.parentNode.nodes.push(locNode);

      switch (locNode.nodeType) {
        case myNodeType.TRANSFORMER: { linkTransformer(locNode); break; }
        case myNodeType.sections: { linkSection(locNode); break; }
        default: {
          //
        }
      }
    }
  });

  // PSs.forEach((locPS) => {
  //    nodes.forEach((locPS) => {

  //   });
  //  });

  return cb();
}

function checkData(cb) {
  // ..
  return cb();
}

const GetNode = nodeName => nodes.get(nodeName);


module.exports.LoadFromDB = LoadFromDB;
module.exports.GetNode = GetNode;

