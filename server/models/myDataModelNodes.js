/* eslint max-len: ["error", { "code": 300 }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

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
const DbNodeTransformerConnector = require('../dbmodels/nodeTransformerConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeSectionConnector = require('../dbmodels/nodeSectionConnector');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');

const logger = require('../logger');

// const MyNode = require('./myNode');
const MyNodeRES = require('./myNodeRES');
const MyNodeLEP = require('./myNodeLEP');
const MyNodeLEPConnection = require('./myNodeLEPConnection');
const MyNodePS = require('./myNodePS');
const MyNodePSPart = require('./myNodePSPart');
const MyNodeTransformer = require('./myNodeTransformer');
const MyNodeTransformerConnector = require('./myNodeTransformerConnector');
const MyNodeSection = require('./myNodeSection');
const MyNodeSectionConnector = require('./myNodeSectionConnector');
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
  [ DbNodeTransformerConnector, MyNodeTransformerConnector ],
  [ DbNodeSection, MyNodeSection ],
  [ DbNodeSectionConnector, MyNodeSectionConnector ],
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
    replaceNamesWithObjects,
    linkNodes,
    checkIntegrity,
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
      // setError(`loading failed: ${err}`);
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
          setError(err);
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
          p.nodeType = DbNodeObj.nodeType;

          const copyProps = DbNodeObj.compareProps;
          copyProps.forEach((pName) => {
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
          setError(s);
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

function replaceNamesWithObjects(callback) {
    // linking names to objects
  async.each(Sheme, (schemeElement, callback) => {
    const DbNodeObj = schemeElement[0];
    let err = null;
    const convertToObjProps = DbNodeObj.convertToObj;
    if ((convertToObjProps) && (convertToObjProps.length > 0)) {
      nodes.forEach((locNode) => {
        if (locNode.nodeType === DbNodeObj.nodeType) {
          convertToObjProps.forEach((pName) => {
            const hasProperty = pName in locNode;
            if (hasProperty) {
              if (nodes.has(locNode[pName])) {
                const nodeItem = locNode;  // unwarn eslint
                nodeItem[pName] = nodes.get(locNode[pName]);
              } else {
                err = `Cannot convert Name to Object on "${locNode.name}". Node Ojbect "${locNode[pName]}" does not exists in loaded nodes!`;
                setError(err);
              }
            } else {
              err = `Cannot convert Name to Object. There is no property with Node "${pName}"!`;
              setError(err);
            }
          });
        }
      });
    }
    callback(err);
  }, (err) => {
    if (err) {
      // setError(`replacing failed: ${err}`);
    } else {
        //
    }
    callback(err);
  }, (err) => {
    callback(err);
  });
}

function linkTransformerToPS(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PS) {
      node.parentNode.transformers.push(node);
    } else if (node.parentNode.nodeType === myNodeType.PSPART) {
      if (node.parentNode.parentNode.nodeType === myNodeType.PS) {
        node.parentNode.parentNode.transformers.push(node);
      } else {
        setError(`Failed to link transformer ${node.name}. Owner PS is not found.`);
      }
    } else {
      setError(`Failed to link transformer. There is no parent for ${node.name}`);
    }
  }
}

function linkSectionToPS(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PS) {
      node.parentNode.sections.push(node);
    } else if (node.parentNode.nodeType === myNodeType.PSPART) {
      if (node.parentNode.parentNode.nodeType === myNodeType.PS) {
        node.parentNode.parentNode.sections.push(node);
      } else {
        setError(`Failed to link section ${node.name}. Owner PS is not found.`);
      }
    } else {
      setError(`Failed to link section. There is no parent for ${node.name}`);
    }
  }
}

function linkNodes(cb) {
  nodes.forEach((locNode) => {
    if (locNode.parentNode) {
      locNode.parentNode.nodes.push(locNode);

      switch (locNode.nodeType) {
        case myNodeType.TRANSFORMER: { linkTransformerToPS(locNode); break; }
        case myNodeType.SECTION: { linkSectionToPS(locNode); break; }
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

function checkIntegrity(cb) {
  PSs.forEach((locPS) => {
    if (locPS.sections.length === 0) {
      setError(`Integrity checking error: PS "${locPS.name}" has no sections!.`);
    } else {
      locPS.sections.forEach((locSection) => {
        if (locSection.nodes.length === 0) {
          setError(`Integrity checking error: Section "${locSection.name}" has no connectors!.`);
        }
      });
    }

    locPS.transformers.forEach((locTransformer) => {
      if (locTransformer.nodes.length === 0) {
        setError(`Integrity checking error: Transformer "${locTransformer.name}" has no connectors!.`);
      } else if (locTransformer.nodes.length < 2) {
        setError(`Integrity checking error: Transformer "${locTransformer.name}" should have at least 2 connectors!.`);
      } else {
        locTransformer.nodes.forEach((locTransConnector) => {
          if (locTransConnector.toSection === undefined) {
            setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to section "${locTransConnector.toSection}". No such section. TransConnector: "${locTransConnector.name}"`);
          } else if (!locPS.sections.includes(locTransConnector.toSection)) {
            setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to section "${locTransConnector.toSection.name}". The Section is not belongs to the parent PS "${locPS.name}". TransConnector: "${locTransConnector.name}"`);
          }
        });
      }
    });

    // each section should have a connector to transformer?
    if (locPS.transformers.length > 0) {
      locPS.sections.forEach((locSection) => {
        locSection.tag = 0;
      });

      locPS.transformers.forEach((locTransformer) => {
        locTransformer.nodes.forEach((locTransConnector) => {
          locTransConnector.toSection.tag = 1;
        });
      });

      locPS.sections.forEach((locSection) => {
        if (locSection.tag === 0) {
          setError(`Integrity checking error: The section "${locSection.name}" is not connected to any of transformers.`);
        }
      });
    }

    // ..
  });
  // ..
  return cb();
}

const GetNode = nodeName => nodes.get(nodeName);


module.exports.LoadFromDB = LoadFromDB;
module.exports.GetNode = GetNode;

