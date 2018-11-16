/* eslint max-len: ["error", { "code": 300 }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

const async = require('async');
const events = require('events');

const myNodeType = require('./myNodeType');

const DbNode = require('../dbmodels/node');
const DbNodeRegion = require('../dbmodels/nodeRegion');
const DbNodeLEP = require('../dbmodels/nodeLEP');
const DbNodeLEPConnection = require('../dbmodels/nodeLEPConnection');
const DbNodePS = require('../dbmodels/nodePS');
const DbNodePSPart = require('../dbmodels/nodePSPart');
const DbNodePSConnector = require('../dbmodels/nodePSConnector');
const DbNodeTransformer = require('../dbmodels/nodeTransformer');
const DbNodeTransformerConnector = require('../dbmodels/nodeTransformerConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeSectionConnector = require('../dbmodels/nodeSectionConnector');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');

const logger = require('../logger');

// const MyNode = require('./myNode');
const MyNodeRegion = require('./myNodeRegion');
const MyNodeLEP = require('./myNodeLEP');
const MyNodeLEPConnection = require('./myNodeLEPConnection');
const MyNodePS = require('./myNodePS');
const MyNodePSPart = require('./myNodePSPart');
const MyNodePSConnector = require('./myNodePSConnector');
const MyNodeTransformer = require('./myNodeTransformer');
const MyNodeTransformerConnector = require('./myNodeTransformerConnector');
const MyNodeSection = require('./myNodeSection');
const MyNodeSectionConnector = require('./myNodeSectionConnector');
const MyNodeEquipment = require('./myNodeEquipment');

const nodes = new Map();
const Regions = new Map();
const LEPs = new Map();
const PSs = new Map();

const Sheme = [
  [ DbNodeRegion, MyNodeRegion ],
  [ DbNodeLEP, MyNodeLEP ],
  [ DbNodeLEPConnection, MyNodeLEPConnection ],
  [ DbNodePS, MyNodePS ],
  [ DbNodePSPart, MyNodePSPart ],
  [ DbNodePSConnector, MyNodePSConnector ],
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
    setupPsNodes,
    checkIntegrity,
  ], () => {
    let res = null;
    if (errs === 0) {
      logger.info(`[sever] loaded from DB with ${nodes.size} Nodes: LEPs=${LEPs.size}, Regions=${Regions.size}, PSs=${PSs.size}`);
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
            case myNodeType.REGION: { Regions.set(locNode.name, p); break; }
            case myNodeType.LEP: { LEPs.set(locNode.name, p); break; }
            case myNodeType.PS: { PSs.set(locNode.name, p); break; }
            default: // nodes.set(locNode.name, p);
          }
          nodes.set(locNode.name, p);
          callback(null);
        } else {
          // node does not exist
          const s = `create myNode Error: DbNode "${dbNodeObj.name}" does not exists!`;
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

function linkLEPConnectorToPS(nodeLEPConnector) {
  if (nodeLEPConnector.toNodeConnector) {
    if (nodeLEPConnector.toNodeConnector.nodeType === myNodeType.SECTIONCONNECTOR) {
      const section = nodeLEPConnector.toNodeConnector.parentNode;
      if (section.parentNode.nodeType === myNodeType.PSPART) {
        nodeLEPConnector.toNode = section.parentNode.parentNode;
      } else if (section.parentNode.nodeType === myNodeType.PS) {
        nodeLEPConnector.toNode = section.parentNode;
      } else {
        setError(`Failed to link LEPConnector: ${nodeLEPConnector.name}. toNodeConnector Owner is not a PS and not a PSPART.`);
      }
    } else {
      setError(`Failed to link LEPConnector: ${nodeLEPConnector.name}. toNodeConnector is not a SECTIONCONNECTOR`);
    }
  } else {
    setError(`Failed to link LEPConnector: ${nodeLEPConnector.name}. There is no Node to connect.`);
  }
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

function linkPSConnectorToPS(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PS) {
      node.parentNode.connectors.push(node);
    } else {
      setError(`Failed to link PSConnector. There is no parent PS for ${node.name}`);
    }
  }
}

function linkNodes(cb) {
  nodes.forEach((locNode) => {
    if (locNode.parentNode) {
      locNode.parentNode.nodes.push(locNode);

      switch (locNode.nodeType) {
        case myNodeType.LEPCONNECTION: { linkLEPConnectorToPS(locNode); break; }
        case myNodeType.TRANSFORMER: { linkTransformerToPS(locNode); break; }
        case myNodeType.SECTION: { linkSectionToPS(locNode); break; }
        case myNodeType.PSCONNECTOR: { linkPSConnectorToPS(locNode); break; }
        default: {
          //
        }
      }
    }
  });

  return cb();
}

function setupPsNodes(cb) {
  PSs.forEach((locPS) => {
    locPS.voltages = [];
    locPS.sections.forEach((locSection) => {
      if (locPS.voltages.indexOf(locSection.voltage) < 0) {
        locPS.voltages.push(locSection.voltage);
      }
    });
  });
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

    // if more than one section with the same voltage, they should be connected with PSConnector
    locPS.voltages.forEach((locVoltage) => {
      const locSections = [];
      locPS.sections.forEach((locSection) => {
        if (locSection.voltage === locVoltage) {
          locSection.tag = 0;
          locSections.push(locSection);
        }
      });
      if (locSections.length === 2) {
        locPS.connectors.forEach((sec2secCon) => {
          if (((sec2secCon.fromSection === locSections[0]) && (sec2secCon.toSection === locSections[1])) ||
              ((sec2secCon.fromSection === locSections[1]) && (sec2secCon.toSection === locSections[0]))) {
                  // ok
          } else {
            setError(`Integrity checking error: No section to section connector found for "${locSections[0].name}" and "${locSections[1].name}" on PS "${locPS.name}"..`);
          }
        });
      } else if (locSections.length === 4) {
        // not yet implemented.
      } else {
        setError(`Integrity checking error: Wrong Section number (${locSections.length}) for voltage ${locVoltage} on PS "${locPS.name}". Sections should be connected between eachother.`);
      }
    });

    locPS.transformers.forEach((locTransformer) => {
      if (locTransformer.nodes.length === 0) {
        setError(`Integrity checking error: Transformer "${locTransformer.name}" has no connectors!.`);
      } else if (locTransformer.nodes.length < 2) {
        setError(`Integrity checking error: Transformer "${locTransformer.name}" should have at least 2 connectors!.`);
      } else {
        locTransformer.nodes.forEach((locTransConnector) => {
          if (locTransConnector.toConnector === undefined) {
            setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to connector "${locTransConnector.toConnector}". No such connector. TransConnector: "${locTransConnector.name}"`);
          } else {
            const section = locTransConnector.toConnector.parentNode;
            if (!locPS.sections.includes(section)) {
              setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to section "${section.name}". The Section is not belongs to the parent PS "${locPS.name}". TransConnector: "${locTransConnector.name}"`);
            }
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
          if (locTransConnector.toConnector.parentNode.nodeType === myNodeType.SECTION) {
            const locToSection = locTransConnector.toConnector.parentNode;
            locToSection.tag = 1;
          } else {
            setError(`Integrity checking error: Transformer "${locTransformer.name}" connector "${locTransConnector.name}" does not connected to the section."`);
          }
        });
      });

      if (locPS.transformers.length > 0) {
        locPS.sections.forEach((locSection) => {
          if (locSection.tag === 0) {
            setError(`Integrity checking error: The section "${locSection.name}" is not connected to any of transformers.`);
          }
        });
      }
    }

    // ..
  });
  // ..
  return cb();
}

const GetNode = nodeName => nodes.get(nodeName);


module.exports.LoadFromDB = LoadFromDB;
module.exports.GetNode = GetNode;

