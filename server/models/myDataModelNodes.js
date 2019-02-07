/* eslint max-len: ["error", { "code": 300 }] */
/* eslint no-param-reassign: ["error", { "props": false }] */
const fs = require('fs');
const moment = require('moment');

const async = require('async');
const events = require('events');

const myNodeType = require('./myNodeType');

const DbNode = require('../dbmodels/node');
const DbNodeRegion = require('../dbmodels/nodeRegion');
const DbNodeLEP = require('../dbmodels/nodeLEP');
const DbNodeLEPConnection = require('../dbmodels/nodeLEPConnection');
const DbNodePS = require('../dbmodels/nodePS');
const DbNodePSPart = require('../dbmodels/nodePSPart');
const DbNodeTransformer = require('../dbmodels/nodeTransformer');
const DbNodeTransformerConnector = require('../dbmodels/nodeTransformerConnector');
const DbNodeSection = require('../dbmodels/nodeSection');
const DbNodeSectionConnector = require('../dbmodels/nodeSectionConnector');
const DbNodeSec2SecConnector = require('../dbmodels/nodeSec2SecConnector');
const DbNodeEquipment = require('../dbmodels/nodeEquipment');
const DbNodeParamLinkage = require('../dbmodels/nodeParamLinkage');
// const DbNodeStateValue = require('../dbmodels/nodeStateValue');


const logger = require('../logger');
const config = require('../../config');
const MyNodeJsonSerialize = require('../models/myNode').MyNodeJsonSerialize;


// const MyNode = require('./myNode');
const MyNodeRegion = require('./myNodeRegion');
const MyNodeLEP = require('./myNodeLEP');
const MyNodeLEPConnection = require('./myNodeLEPConnection');
const MyNodePS = require('./myNodePS');
const MyNodePSPart = require('./myNodePSPart');
const MyNodeTransformer = require('./myNodeTransformer');
const MyNodeTransformerConnector = require('./myNodeTransformerConnector');
const MyNodeSection = require('./myNodeSection');
const MyNodeSectionConnector = require('./myNodeSectionConnector');
const MyNodeSec2SecConnector = require('./myNodeSec2SecConnector');
const MyNodeEquipment = require('./myNodeEquipment');

const myNodeState = require('./myNodeState');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const MyParamList = require('./myParamList');


const nodes = new Map();
const Regions = new Map();
const LEPs = new Map();
const PSs = new Map();

const Shema = [
  [ DbNodeRegion, MyNodeRegion ],
  [ DbNodeLEP, MyNodeLEP ],
  [ DbNodeLEPConnection, MyNodeLEPConnection ],
  [ DbNodePS, MyNodePS ],
  [ DbNodePSPart, MyNodePSPart ],
  [ DbNodeTransformer, MyNodeTransformer ],
  [ DbNodeTransformerConnector, MyNodeTransformerConnector ],
  [ DbNodeSection, MyNodeSection ],
  [ DbNodeSectionConnector, MyNodeSectionConnector ],
  [ DbNodeSec2SecConnector, MyNodeSec2SecConnector ],
  [ DbNodeEquipment, MyNodeEquipment ],
];


let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[ModelNodes] ${text}`);
}

function setWarning(text) {
  // errs += 1;
  logger.warn(`[ModelNodes] ${text}`);
}

process
  .on('unhandledRejection', (reason, p) => {
    const s = `Unhandled Rejection at Promise: ${reason}  ${p}`;
    setError(s);
    // eslint-disable-next-line no-console
    console.error(s);
    process.exit(1);
  })
  .on('uncaughtException', (err) => {
    const s = `Uncaught Exception thrown: ${err.message} \r\n callstack: ${err.stack}`;
    setError(s);
    // eslint-disable-next-line no-console
    console.error(s);
    process.exit(1);
  });

const LoadFromDB = (cb) => {
  const start = moment();
  errs = 0;
  async.series([
    clearData,
    loadNodes,
    replaceNamesWithObjects,
    linkNodes,
    checkIntegrity,
    linkParamNamesToNodes,
    restoreLastStateValues,
  ], () => {
    let res = null;
    if (errs === 0) {
      const duration = moment().diff(start);
      logger.info(`[ModelNodes] loaded from DB with ${nodes.size} Nodes in ${moment(duration).format('mm:ss.SSS')}`);
    } else {
      res = `loading nodes failed with ${errs} errors!`;
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
  async.eachSeries(Shema, (schemeElement, callback) => {
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
          p.sapCode = locNode.sapCode;

          const copyProps = DbNodeObj.compareProps;
          for (let i = 0; i < copyProps.length; i += 1) {
            const pName = copyProps[i];
            const hasProperty = pName in p;
            if (hasProperty) {
              p[pName] = dbNodeObj[pName];
            } else {
              setError(`Node Ojbect "${dbNodeObj.name}" has no property "${pName}"!`);
            }
          }

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

function getPSForJson(ps) {
  const locPS = new MyNodePS(ps.name, ps.caption, ps.description);
  locPS.parentNode = ps.parentNode.name;
  locPS.sapCode = ps.sapCode;
  ps.transformers.forEach((transformer) => {
    const locTransformer = new MyNodeTransformer(transformer.name, transformer.caption, transformer.description);
    locPS.transformers.push(locTransformer);
    locTransformer.sapCode = transformer.sapCode;
    transformer.connectors.forEach((transConnector) => {
      const locTransConnector = new MyNodeTransformerConnector(transConnector.name, transConnector.caption, transConnector.description);
      locTransConnector.toConnector = transConnector.toConnector.name;
      locTransformer.connectors.push(locTransConnector);
    });
  });
  ps.psparts.forEach((pspart) => {
    const locPSPart = new MyNodePSPart(pspart.name, pspart.caption, pspart.description);
    locPS.psparts.push(locPSPart);
    locPSPart.sapCode = pspart.sapCode;
    locPSPart.voltage = pspart.voltage;
    pspart.sections.forEach((section) => {
      const locSection = new MyNodeSection(section.name, section.caption, section.description);
      locPSPart.sections.push(locSection);
      locSection.sapCode = section.sapCode;
      section.connectors.forEach((connection) => {
        const locConnector = new MyNodeSectionConnector(connection.name, connection.caption, connection.description);
        locSection.connectors.push(locConnector);
        locConnector.sapCode = connection.sapCode;
        locConnector.cellNumber = connection.cellNumber;
        locConnector[MyNodePropNameParamRole.POWER] = connection[MyNodePropNameParamRole.POWER];
        connection.equipments.forEach((equipment) => {
          const locEquipment = new MyNodeEquipment(equipment.name, equipment.caption, equipment.description);
          locConnector.equipments.push(locEquipment);
          locEquipment.sapCode = equipment.sapCode;
          locEquipment.equipmentType = equipment.equipmentType;
          locEquipment[MyNodePropNameParamRole.STATE] = equipment[MyNodePropNameParamRole.STATE];
        });
      });
    });

    pspart.connectors.forEach((connection) => {
      const locConnector = new MyNodeSec2SecConnector(connection.name, connection.caption, connection.description);
      locPSPart.connectors.push(locConnector);
      locConnector.fromSection = connection.fromSection.name;
      locConnector.toSection = connection.toSection.name;
      locConnector.cellNumber = connection.cellNumber;
      locConnector[MyNodePropNameParamRole.POWER] = connection[MyNodePropNameParamRole.POWER];
      connection.equipments.forEach((equipment) => {
        const locEquipment = new MyNodeEquipment(equipment.name, equipment.caption, equipment.description);
        locConnector.equipments.push(locEquipment);
        locEquipment.sapCode = equipment.sapCode;
        locEquipment.equipmentType = equipment.equipmentType;
        locEquipment[MyNodePropNameParamRole.STATE] = equipment[MyNodePropNameParamRole.STATE];
      });
    });
  });

  return locPS;
}

function ExportPSs(callback) {
  async.each(PSs, (locNodePair, callback) => {
    const ps = locNodePair[1];
    const json = MyNodeJsonSerialize(getPSForJson(ps));

    fs.writeFile(`${config.exportPath}${ps.name}.json`, json, 'utf8', (err) => {
      if (err) {
        setError(err);
        // console.error(`Failed! Error: ${err}`);
      } else {
        // console.info('FileWriteDone!');
      }
      callback(err);
    });
  }, (err) => {
    callback(err);
  });
}

function replaceNamesWithObjects(callback) {
    // linking names to objects
  async.each(Shema, (schemeElement, callback) => {
    const DbNodeObj = schemeElement[0];
    let err = null;
    const convertToObjProps = DbNodeObj.convertToObj;
    if ((convertToObjProps) && (convertToObjProps.length > 0)) {
      const locNodes = Array.from(nodes.values());
      for (let i = 0; i < locNodes.length; i += 1) {
        const locNode = locNodes[i];
        if (locNode.nodeType === DbNodeObj.nodeType) {
          for (let j = 0; j < convertToObjProps.length; j += 1) {
            const pName = convertToObjProps[j];
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
          }
        }
      }
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

function linkSectionToPSPart(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PSPART) {
      node.parentNode.sections.push(node);
    } else {
      setError(`Failed to link section. There is no parent PSPart for ${node.name}`);
    }
  }
}

function linkPSPartToPS(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PS) {
      node.parentNode.psparts.push(node);
    } else {
      setError(`Failed to link PSPart. There is no parent PS for ${node.name}`);
    }
  }
}

function linkSec2SecConnectorToPSPart(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PSPART) {
      node.parentNode.connectors.push(node);
    } else {
      setError(`Failed to link Sec2SecConnector. There is no parent PSPart for ${node.name}`);
    }
  }
}

function linkSectionConnectorToSection(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.SECTION) {
      node.parentNode.connectors.push(node);
    } else {
      setError(`Failed to link SectionConnector. There is no parent Section for ${node.name}`);
    }
  }
}

function linkTransformerConnectorToTransformer(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.TRANSFORMER) {
      node.parentNode.connectors.push(node);
    } else {
      setError(`Failed to link TransformerConnector. There is no parent Transformer for ${node.name}`);
    }
  }
}

function linkEquipmentToSectionConnector(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.SECTIONCONNECTOR) {
      node.parentNode.equipments.push(node);
    } else if (node.parentNode.nodeType === myNodeType.SEC2SECCONNECTOR) {
      node.parentNode.equipments.push(node);
    } else {
      setError(`Failed to link Equipment. There is no parent Connector for ${node.name}`);
    }
  }
}

function linkNodes(cb) {
  const locNodes = Array.from(nodes.values());
  for (let i = 0; i < locNodes.length; i += 1) {
    const locNode = locNodes[i];
    if (locNode.parentNode) {
      switch (locNode.nodeType) {
        case myNodeType.LEPCONNECTION: { linkLEPConnectorToPS(locNode); break; }
        case myNodeType.TRANSFORMER: { linkTransformerToPS(locNode); break; }
        case myNodeType.PSPART: { linkPSPartToPS(locNode); break; }
        case myNodeType.SECTION: { linkSectionToPSPart(locNode); break; }
        case myNodeType.SEC2SECCONNECTOR: { linkSec2SecConnectorToPSPart(locNode); break; }
        case myNodeType.SECTIONCONNECTOR: { linkSectionConnectorToSection(locNode); break; }
        case myNodeType.TRANSFORMERCONNECTOR: { linkTransformerConnectorToTransformer(locNode); break; }
        case myNodeType.EQUIPMENT: { linkEquipmentToSectionConnector(locNode); break; }
        default: {
          //
        }
      }
    }
  }

  return cb();
}

function checkIntegrity(cb) {
  const locPSs = Array.from(PSs.values());
  for (let i = 0; i < locPSs.length; i += 1) {
    const locPS = locPSs[i];
    for (let j = 0; j < locPS.psparts.length; j += 1) {
      const locPSPart = locPS.psparts[j];
      if (locPSPart.sections.length === 0) {
        setError(`Integrity checking error: PSPart "${locPSPart.name}" has no sections!.`);
      } else {
        for (let k = 0; k < locPSPart.sections.length; k += 1) {
          const locSection = locPSPart.sections[k];
          if (locSection.connectors.length === 0) {
            setWarning(`Integrity checking error: Section "${locSection.name}" has no connectors!.`);
          }
        }
      }
    }

    // if more than one section with the same voltage, they should be connected with Sec2SecConnector
    for (let j = 0; j < locPS.psparts.length; j += 1) {
      const locPSPart = locPS.psparts[j];
      switch (locPSPart.sections.length) {
        case 0: {
          setError(`Integrity checking error: No Sections found for ${locPSPart}.`);
          break;
        }
        case 1: break;
        case 2: {
          if (locPSPart.connectors.length === 1) {
            const sec2secCon = locPSPart.connectors[0];
            if (!(((sec2secCon.fromSection === locPSPart.sections[0]) && (sec2secCon.toSection === locPSPart.sections[1])) ||
            ((sec2secCon.fromSection === locPSPart.sections[1]) && (sec2secCon.toSection === locPSPart.sections[0])))) {
              setError(`Integrity checking error: No section to section connector found for "${locPSPart.sections[0].name}" and "${locPSPart.sections[1].name}" on PS "${locPS.name}"..`);
            }
          }
          break;
        }
        case 4: {
        // not yet implemented.
          break;
        }
        default: {
          setWarning(`Integrity checking error: Wrong Section number (${locPSPart.sections.length}) on PSPart "${locPSPart.name}". Sections should be connected between eachother.`);
          break;
        }
      }
    }

    locPS.transformers.forEach((locTransformer) => {
      if (locTransformer.connectors.length === 0) {
        setError(`Integrity checking error: Transformer "${locTransformer.name}" has no connectors!.`);
      } else if (locTransformer.connectors.length < 2) {
        setError(`Integrity checking error: Transformer "${locTransformer.name}" should have at least 2 connectors!.`);
      } else {
        locTransformer.connectors.forEach((locTransConnector) => {
          if (locTransConnector.toConnector === undefined) {
            setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to connector "${locTransConnector.toConnector}". No such connector. TransConnector: "${locTransConnector.name}"`);
          } else {
            // const section = locTransConnector.toConnector.parentNode;
            // if (!locPS.sections.includes(section)) {
            //   setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to section "${section.name}". The Section is not belongs to the parent PS "${locPS.name}". TransConnector: "${locTransConnector.name}"`);
            // }
          }
        });
      }
    });

    // each section should have a connector to transformer?
    if (locPS.transformers.length > 0) {
      locPS.psparts.forEach((locPSPart) => {
        locPSPart.sections.forEach((locSection) => {
          locSection.tag = 0;
        });
      });
    }


    locPS.transformers.forEach((locTransformer) => {
      locTransformer.connectors.forEach((locTransConnector) => {
        if (locTransConnector.toConnector.parentNode.nodeType === myNodeType.SECTION) {
          const locToSection = locTransConnector.toConnector.parentNode;
          locToSection.tag = 1;
        } else {
          setError(`Integrity checking error: Transformer "${locTransformer.name}" connector "${locTransConnector.name}" does not connected to the section."`);
        }
      });
    });

    // if (locPS.transformers.length > 0) {
    //   locPS.psparts.forEach((locPSPart) => {
    //     locPSPart.sections.forEach((locSection) => {
    //       if (locSection.tag === 0) {
    //         setError(`Integrity checking error: The section "${locSection.name}" is not connected to any of transformers.`);
    //       }
    //     });
    //   });
    // }


    // ..
  }
  // ..
  return cb();
}


function linkParamNamesToNodes(cb) {
  DbNodeParamLinkage.find({}, null, { }, (err, linkages) => {
    if (err) return cb(err);

    logger.info(`[ModelNodes] found ${linkages.length} NodeParamLinkages..`);
    for (let i = 0; i < linkages.length; i += 1) {
      const dbNodeLinkage = linkages[i];
      const locNode = nodes.get(dbNodeLinkage.nodeName);
      if (locNode) {
        const hasProperty = dbNodeLinkage.paramPropName in locNode;
        if (hasProperty) {
          locNode[dbNodeLinkage.paramPropName] = dbNodeLinkage.paramPropValue;
        } else {
          setError(`Node "${locNode.name}" has no property "${dbNodeLinkage.paramPropName}"!`);
        }
      } else {
          // node does not exist
        const s = `create myNode Error: DbNode "${dbNodeLinkage.nodeName}" does not exists!`;
        setWarning(s);
      }
    }
    return cb();
  });
}

const RelinkParamNamesToNodes = (cb) => {
  linkParamNamesToNodes(cb);
};

const SetStateChangedHandler = (stateHandler) => {
  const locPSs = Array.from(PSs.values());
  for (let i = 0; i < locPSs.length; i += 1) {
    const ps = locPSs[i];
    ps.stateChangeHandler = stateHandler;
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      pspart.stateChangeHandler = stateHandler;
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        section.stateChangeHandler = stateHandler;
        for (let l = 0; l < section.connectors.length; l += 1) {
          const connector = section.connectors[l];
          connector.stateChangeHandler = stateHandler;
          for (let m = 0; m < connector.equipments.length; m += 1) {
            const equipment = connector.equipments[m];
            equipment.stateChangeHandler = stateHandler;
          }
        }
      }

      for (let l = 0; l < pspart.connectors.length; l += 1) {
        const connector = pspart.connectors[l];
        connector.stateChangeHandler = stateHandler;

        for (let m = 0; m < connector.equipments.length; m += 1) {
          const equipment = connector.equipments[m];
          equipment.stateChangeHandler = stateHandler;
        }
      }
    }
  }
};

function StoreLastStateValues() {
  const start = moment();
  const states = [];
  const locNodes = Array.from(nodes.values());
  for (let i = 0; i < locNodes.length; i += 1) {
    const locNode = locNodes[i];
    if (locNode.nodeState !== myNodeState.NODE_STATE_UNKNOWN) {
      states.push({ n: locNode.name, v: locNode.nodeState });
    }
  }
  const data = JSON.stringify(states);
  const duration1 = moment().diff(start);
  try {
    fs.writeFileSync(`${config.storePath}lastStates.json`, data);
  } catch (err) {
    logger.error(`[ModelNodes] saving LastStateValues error: ${err}`);
    return;
  }
  const duration2 = moment().diff(start);
  logger.debug(`[ModelNodes] LastStateValues prepared in ${moment(duration1).format('mm:ss.SSS')} and saved in  ${moment(duration2).format('mm:ss.SSS')}`);
}

function restoreLastStateValues(callback) {
  const start = moment();
  let count = 0;
  const fileName = `${config.storePath}lastStates.json`;

  if (!fs.exists(fileName, (exists) => {
    if (!exists) {
      const err = `file "${fileName}" does not exists`;
      logger.warn(`[ModelNodes][restoreLastStateValues] failed. File "${fileName}" is not found.`);
      callback(err);
      return;
    }
    fs.readFile(fileName, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      const states = JSON.parse(data);
      const duration1 = moment().diff(start);

      for (let i = 0; i < states.length; i += 1) {
        const state = states[i];
        if (nodes.has(state.n)) {
          const node = nodes.get(state.n);
          node.stateValue = state.v;
          count += 1;
        } else {
          logger.warn(`[ModelNodes][restoreLastStateValues] failed to find node: ${state.n}`);
        }
      }

      const duration2 = moment().diff(start);
      logger.debug(`[ModelNodes] ${count} LastStateValues loaded in ${moment(duration2).format('mm:ss.SSS')} (file loaded and parsed in ${moment(duration1).format('mm:ss.SSS')})`);
      callback();
    });
  }));
}


const GetNode = nodeName => nodes.get(nodeName);

const GetRegions = () => Array.from(Regions.values());
const GetRegionPSs = (region) => {
  const result = [];
  PSs.forEach((ps) => {
    if (ps.parentNode) {
      if (ps.parentNode.name === region) {
        result.push(ps);
      }
    }
  });

  return result;
};

const GetPSForJson = (name) => {
  if (PSs.has(name)) {
    const locPS = PSs.get(name);
    return MyNodeJsonSerialize(getPSForJson(locPS));
  }
  return null;
};

function pushIfNotPushed(array, element) {
  if (array.indexOf(element) < 0) {
    array.push(element);
  }
}

function arrayUnique(array) {
  const a = array.concat();
  for (let i = 0; i < a.length; i += 1) {
    for (let j = i + 1; j < a.length; j += 1) {
      if (a[i] === a[j]) {
        a.splice(j -= 1, 1);
      }
    }
  }
  return a;
}

const GetParamsListsForEachPS = () => {
  const paramLists = [];
  const locPSs = Array.from(PSs.values());
  for (let i = 0; i < locPSs.length; i += 1) {
    const ps = locPSs[i];
    const paramNames = [];
    const stateParamNames = [];
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        for (let l = 0; l < section.connectors.length; l += 1) {
          const connector = section.connectors[l];
          if (MyNodePropNameParamRole.POWER in connector) {
            if (connector[MyNodePropNameParamRole.POWER] !== '') {
              pushIfNotPushed(paramNames, connector[MyNodePropNameParamRole.POWER]);
            }
          }
          for (let m = 0; m < connector.equipments.length; m += 1) {
            const equipment = connector.equipments[m];
            if (MyNodePropNameParamRole.STATE in equipment) {
              if (equipment[MyNodePropNameParamRole.STATE] !== '') {
                pushIfNotPushed(stateParamNames, equipment[MyNodePropNameParamRole.STATE]);
              }
            }
          }
        }
      }

      for (let l = 0; l < pspart.connectors.length; l += 1) {
        const connector = pspart.connectors[l];
        if (MyNodePropNameParamRole.POWER in connector) {
          if (connector[MyNodePropNameParamRole.POWER] !== '') {
            pushIfNotPushed(paramNames, connector[MyNodePropNameParamRole.POWER]);
          }
        }

        for (let m = 0; m < connector.equipments.length; m += 1) {
          const equipment = connector.equipments[m];
          if (MyNodePropNameParamRole.STATE in equipment) {
            if (equipment[MyNodePropNameParamRole.STATE] !== '') {
              pushIfNotPushed(stateParamNames, equipment[MyNodePropNameParamRole.STATE]);
            }
          }
        }
      }
    }

    if (stateParamNames.length > 0) {
      const pl = new MyParamList(myNodeState.PARAMLIST_STATE_PREFIX + ps.name, '', '', stateParamNames);
      paramLists.push(pl);
    }
    if ((paramNames.length > 0) || (stateParamNames.length > 0)) {
      const concatenatedParamNames = arrayUnique(paramNames.concat(stateParamNames));
      const pl = new MyParamList(ps.name, ps.caption, '', concatenatedParamNames);
      paramLists.push(pl);
    }
  }
  return paramLists;
};

module.exports.LoadFromDB = LoadFromDB;
module.exports.RelinkParamNamesToNodes = RelinkParamNamesToNodes;
module.exports.SetStateChangedHandler = SetStateChangedHandler;
module.exports.GetNode = GetNode;
module.exports.ExportPSs = ExportPSs;
module.exports.GetRegions = GetRegions;
module.exports.GetRegionPSs = GetRegionPSs;
module.exports.GetPSForJson = GetPSForJson;
module.exports.GetParamsListsForEachPS = GetParamsListsForEachPS;
module.exports.StoreLastStateValues = StoreLastStateValues;
