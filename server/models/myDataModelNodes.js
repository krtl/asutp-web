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
const DbNodeLEP2LEPConnection = require('../dbmodels/nodeLEP2LEPConnection');
const DbNodeLEP2PSConnection = require('../dbmodels/nodeLEP2PSConnection');
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
const DbNetNodeShema = require('../dbmodels/netNodeSchema');
const DbNodeList = require('../dbmodels/nodeList');


const logger = require('../logger');
const config = require('../../config');
const MyNodeJsonSerialize = require('../models/myNode').MyNodeJsonSerialize;


const MyNode = require('./myNode');
const MyNodeRegion = require('./myNodeRegion');
const MyNodeLEP = require('./myNodeLEP');
const MyNodeLEP2LEPConnection = require('./myNodeLEP2LEPConnection');
const MyNodeLEP2PSConnection = require('./myNodeLEP2PSConnection');
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

const MySchemeWire = require('./mySchemeWire');
const MyNodeList = require('./myNodeList');


const nodes = new Map();
const Regions = new Map();
const LEPs = new Map();
const PSs = new Map();
const nodeLists = new Map();

const Shema = [
  [ DbNodeRegion, MyNodeRegion ],
  [ DbNodeLEP, MyNodeLEP ],
  [ DbNodeLEP2LEPConnection, MyNodeLEP2LEPConnection ],
  [ DbNodeLEP2PSConnection, MyNodeLEP2PSConnection ],
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
    loadNodeLists,
    createNodeListsForRegions,
  ], () => {
    let res = null;
    if (errs === 0) {
      const duration = moment().diff(start);
      logger.info(`[ModelNodes] loaded from DB with ${nodes.size} Nodes in ${moment(duration).format('mm:ss.SSS')}`);

      // eslint-disable-next-line no-console
      console.debug(`[ModelNodes] loaded in ${moment(duration).format('mm:ss.SSS')}`);
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

function linkLEP2LEPConnectorToLEP(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.LEP) {
      node.parentNode.lep2lepConnectors.push(node);
    } else {
      setError(`Failed to link LEP2LEPConnector. There is no parent LEP for ${node.name}`);
    }
  }
}

function linkLEP2PSConnectorToLepAndToPS(lep2psConnector) {
  if (lep2psConnector.parentNode) {
    if (lep2psConnector.parentNode.nodeType === myNodeType.LEP) {
      const lep = lep2psConnector.parentNode;
      lep.lep2psConnectors.push(lep2psConnector);
    } else {
      setError(`Failed to link LEP2PSConnector. There is no parent LEP for ${lep2psConnector.name}`);
    }
  }

  if (lep2psConnector.toNodeConnector) {
    if (lep2psConnector.toNodeConnector.nodeType === myNodeType.SECTIONCONNECTOR) {
      const section = lep2psConnector.toNodeConnector.parentNode;
      if (section.parentNode.nodeType === myNodeType.PSPART) {
        const pspart = section.parentNode;
        if (pspart.parentNode.nodeType === myNodeType.PS) {
          const ps = pspart.parentNode;
          ps.lep2psConnectors.push(lep2psConnector);
        } else {
          setError(`Failed to link LEPConnector: ${lep2psConnector.name}. toNodeConnector Owner is not PS`);
        }
      } else {
        setError(`Failed to link LEPConnector: ${lep2psConnector.name}. toNodeConnector Owner is not PS`);
      }
    } else {
      setError(`Failed to link LEP2PSConnector: ${lep2psConnector.name}. toNodeConnector is not a SECTIONCONNECTOR`);
    }
  } else {
    setError(`Failed to link LEP2PSConnector: ${lep2psConnector.name}. There is no Node to connect.`);
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
        case myNodeType.LEP2LEPCONNECTION: { linkLEP2LEPConnectorToLEP(locNode); break; }
        case myNodeType.LEP2PSCONNECTION: { linkLEP2PSConnectorToLepAndToPS(locNode); break; }
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

const SetManualStates = (manualStates) => {
  let err = '';
  for (let i = 0; i < manualStates.length; i += 1) {
    const locState = manualStates[i];
    if (nodes.has(locState.nodeName)) {
      const locNode = nodes.get(locState.nodeName);

      if (locNode.nodeState !== locState.newState) {
        logger.debug(`[ModelNodes][SetManualStates] "${locNode.name}" ${locNode.nodeState}->${locState.newState}.`);
        locNode.doOnStateChanged(locState.newState);
      }
    } else {
      err += `${locState.nodeName}, `;
    }
  }

  if (err !== '') {
    err = `Unknown nodes: ${err}`;
  }
  return err;
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
          node.nodeState = state.v;
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

const GetNodeLists = () => Array.from(nodeLists.values());
const GetRegions = () => Array.from(Regions.values());

const GetSchemaPSs = (schemaName) => {
  const result = [];
  if (nodeLists.has(schemaName)) {
    const nodeList = nodeLists.get(schemaName);
    for (let i = 0; i < nodeList.nodes.length; i += 1) {
      const node = nodeList.nodes[i];
      if (node.nodeType === myNodeType.PS) {
        result.push(node);
      }
    }
  }

  return result;
};

const getNodeForScheme = (nodes) => {
  const resultNodes = [];

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const locNode = new MyNode(node.name, node.caption, node.description, node.nodeType);
    locNode.parentNode = node.parentNode.name;
    locNode.sapCode = node.sapCode;
    locNode.nodeState = node.nodeState;
    locNode.parentNode = undefined;
    locNode.description = undefined;
    resultNodes.push(locNode);
  }
  return resultNodes;
};

const getSchema1 = (schemaName, callback) => {
  const pss = [];
  const leps = [];
  const wires = [];

  if (!nodeLists.has(schemaName)) {
    // eslint-disable-next-line no-console
    console.error(`Unknown nodeList with name= ${schemaName}`);
    const result = { nodes: [], wires };

    callback('', result);
    return 1;
  }

  const locNodeList = nodeLists.get(schemaName);
  for (let i = 0; i < locNodeList.nodes.length; i += 1) {
    const node = locNodeList.nodes[i];
    switch (node.nodeType) {
      case myNodeType.PS: { pss.push(node); break; }
      case myNodeType.LEP: { leps.push(node); break; }
      default: {
        //
      }
    }
  }

  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];

    for (let j = 0; j < ps.lep2psConnectors.length; j += 1) {
      const lep2ps = ps.lep2psConnectors[j];

      if (lep2ps.parentNode) {
        const lep = lep2ps.parentNode;
        if (leps.indexOf(lep) < 0) {
          leps.push(lep);
          logger.warn(`[ModelNodes][getSchema] added lep: ${lep.name} that should be previously include into NodeList: ${locNodeList.name}`);
        }
      }
      const wire = new MySchemeWire(lep2ps.name, lep2ps.caption, lep2ps.description, lep2ps.nodeType);
      wire.nodeFrom = lep2ps.parentNode.name;
      wire.nodeTo = ps.name;
      wires.push(wire);
    }
  }

  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    for (let j = 0; j < lep.lep2lepConnectors.length; j += 1) {
      const lep2lep = lep.lep2lepConnectors[j];
      if ((lep2lep.parentNode) && (lep2lep.toNode)) {
        if ((leps.indexOf(lep2lep.parentNode) > 0) && (leps.indexOf(lep2lep.toNode.name) > 0)) {
          const wire = new MySchemeWire(lep2lep.name, lep2lep.caption, lep2lep.description, lep2lep.nodeType);
          wire.nodeFrom = lep2lep.parentNode.name;
          wire.nodeTo = lep2lep.toNode.name;
          wires.push(wire);
        } else {
          logger.warn(`[ModelNodes][getSchema] failed to find nodes on lep2lep: ${lep2lep.name}`);
        }
      }
    }
  }

  const nodes = getNodeForScheme(leps.concat(pss));
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    node.peers = [];
    node.tag = 0;
  }

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    for (let j = 0; j < wires.length; j += 1) {
      const wire = wires[j];
      if (wire.nodeFrom === node.name) {
        const locNode = nodes.find(nde => (nde.name === wire.nodeTo));
        if (locNode) {
          node.peers.push(locNode);
        }
      }
      if (wire.nodeTo === node.name) {
        const locNode = nodes.find(nde => (nde.name === wire.nodeFrom));
        if (locNode) {
          node.peers.push(locNode);
        }
      }
    }
  }

  // nodes.sort((a, b) => {
  //   if (a.peers.length > b.peers.length) {
  //     return -1;
  //   }
  //   if (a.peers.length < b.peers.length) {
  //     return 1;
  //   }
  //   return 0;
  // });

  let matrixNum = 1;
  const setPeersNumber = (node) => {
    node.tag = matrixNum;
    matrixNum += 1;
    for (let j = 0; j < node.peers.length; j += 1) {
      const peer = node.peers[j];
      if (node.peers.length < peer.peers.length) {
        setPeersNumber(peer);
      } else {
        peer.tag = node.tag;
      }
    }
  };

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if ((node.peers.length > 0) && (node.tag === 0)) {
      setPeersNumber(node);
    }
  }

  const matrix = [];
  for (let i = 0; i < matrixNum; i += 1) {
    const line = [];
    for (let j = 0; j < nodes.length; j += 1) {
      const node = nodes[j];
      if (node.tag === i) {
        line.push(node);
      }
    }
    if (line.length > 0) {
      line.sort((a, b) => (b.peers.length - a.peers.length));
      matrix.push(line);
    }
  }

  // const getRelatedPeersCount = (nodes, peerNumb) => {
  //   let result = 0;
  //   for (let i = 0; i < nodes.length; i += 1) {
  //     const node = nodes[i];
  //     for (let j = 0; j < node.peers.length; j += 1) {
  //       const peer = node.peers[j];
  //       if (peer.tag === peerNumb) {
  //         result += 1;
  //       }
  //     }
  //   }
  //   return result;
  // };

  // matrix.sort((a, b) => {
  //   if ((a.length > 0) && (b.length > 0)) {
  //     const nodeA = a[0];
  //     const nodeB = b[0];
  //     return (getRelatedPeersCount(b, nodeA.tag) - getRelatedPeersCount(a, nodeB.tag));
  //   }
  //   return 0;
  // });

  const getPeersCount = (nodes) => {
    let result = 0;
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      result += node.peers.length;
    }
    return result;
  };

  matrix.sort((a, b) => {
    if ((a.length > 0) && (b.length > 0)) {
      return (getPeersCount(b) - getPeersCount(a));
    }
    return 0;
  });

  const WIDTH = 55;
  const HEIGHT = Math.ceil(nodes.length / 50) + 2;

  const setMatrixForLine = (line) => {
    if (line.length < 4) {
      for (let i = 0; i < line.length; i += 1) {
        const node = line[i];
        node.x = i;
        node.y = 0;
      }
      return { height: 1, width: line.length };
    }

    if (line.length < 9) {
      const width = Math.ceil(line.length / 2);
      for (let i = 0; i < line.length; i += 1) {
        const node = line[i];
        if (i < width) {
          node.x = i;
          node.y = 0;
        } else {
          node.x = i - width;
          node.y = 1;
        }
      }
      return { height: 2, width };
    }

    const height = Math.ceil(Math.sqrt(line.length));
    const width = Math.ceil(line.length / height);
    let x1 = Math.floor(width / 2);
    let y1 = Math.floor(height / 2);
    let x2 = x1 + 1;
    let y2 = y1;


    for (let i = 0; i < line.length; i += 1) {
      const node = line[i];
      if ((i % 2) > 0) {
        node.x = x2;
        node.y = y2;
        if (x2 < width - 1) {
          x2 += 1;
        } else {
          x2 = 0;
          y2 += 1;
          if (y2 >= height) {
            x2 = 0;
            y2 = 0;
            // eslint-disable-next-line no-console
            // console.error('setMatrix error!');
          }
        }
      } else {
        node.x = x1;
        node.y = y1;
        if (x1 > 0) {
          x1 -= 1;
        } else {
          x1 = width - 1;
          y1 -= 1;
          if (y1 < 0) {
            x1 = width - 1;
            y1 = height - 1;
            // eslint-disable-next-line no-console
            // console.error('setMatrix error!');
          }
        }
      }
    }
    return { height, width };
  };

  const dimensions = [];
  const located = [];
  for (let i = 0; i < matrix.length; i += 1) {
    const line = matrix[i];
    const dimension = setMatrixForLine(line);
    dimensions.push(dimension);
    located.push(0);
  }

  const nodesMatrix = [];
  for (let i = 0; i < HEIGHT; i += 1) {
    nodesMatrix[i] = [];
    for (let j = 0; j < WIDTH; j += 1) {
      nodesMatrix[i][j] = 0;
    }
  }

  const isMatrixPositionFree = (dimension, x, y) => {
    for (let i = 0; i < dimension.height; i += 1) {
      for (let j = 0; j < dimension.width; j += 1) {
        if ((x + j >= WIDTH) || (y + i >= HEIGHT)) {
          return false;
        }
        if (nodesMatrix[y + i][x + j] !== 0) {
          return false;
        }
      }
    }
    return true;
  };

  const occupyMatrixPosition = (dimension, x, y) => {
    for (let i = 0; i < dimension.height; i += 1) {
      for (let j = 0; j < dimension.width; j += 1) {
        nodesMatrix[y + i][x + j] = 1;
      }
    }
  };

  const moveCoordinatesForLine = (line, offsetX, offsetY) => {
    for (let i = 0; i < line.length; i += 1) {
      const node = line[i];
      node.x += offsetX;
      node.y += offsetY;
    }
  };

  const getNextXY = (dimension, _x, _y) => {
    let x = _x;
    let y = _y;
    x = _x + dimension.width;
    if ((x < WIDTH) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x + dimension.width;
    y = _y - dimension.height;
    if ((x < WIDTH) && (y >= 0) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x;
    y = _y - dimension.height;
    if ((x >= 0) && (y >= 0) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x - dimension.width;
    y = _y - dimension.height;
    if ((x >= 0) && (y >= 0) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x - dimension.width;
    y = _y;
    if ((x >= 0) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x - dimension.width;
    y = _y + dimension.height;
    if ((x >= 0) && (y < HEIGHT) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x;
    y = _y + dimension.height;
    if ((x >= 0) && (y < HEIGHT) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }
    x = _x + dimension.width;
    y = _y + dimension.height;
    if ((x < WIDTH) && (y < HEIGHT) && (isMatrixPositionFree(dimension, x, y))) {
      return { x, y };
    }

    for (let k = 0; k < HEIGHT; k += 1) {
      for (let l = 0; l < WIDTH; l += 1) {
        if (nodesMatrix[k][l] === 0) {
          if (isMatrixPositionFree(dimension, l, k)) {
            return { x: l, y: k };
          }
        }
      }
    }

    // eslint-disable-next-line no-console
    console.error(`setNextXY error for ${dimension.width}:${dimension.height}`);
    return { x: 0, y: 0 };
  };

  let x = Math.floor(WIDTH / 3);
  let y = Math.floor(HEIGHT / 3);
  for (let i = 0; i < matrix.length; i += 1) {
    const line = matrix[i];
    const dimension = dimensions[i];
    const xy = getNextXY(dimension, x, y);
    x = xy.x;
    y = xy.y;
    if (isMatrixPositionFree(dimension, x, y)) {
      occupyMatrixPosition(dimension, x, y);
      moveCoordinatesForLine(line, x, y);
      located[i] = 1;
    }
  }

  for (let i = 0; i < matrix.length; i += 1) {
    const line = matrix[i];
    if (located[i] === 0) {
      located[i] = 1;
      for (let j = 0; j < line.length; j += 1) {
        const node = line[j];

        for (let k = 0; k < HEIGHT; k += 1) {
          for (let l = 0; l < WIDTH; l += 1) {
            if (nodesMatrix[k][l] === 0) {
              nodesMatrix[k][l] = 1;
              node.x = l;
              node.y = k;
              k = WIDTH;
              break;
            }
          }
        }
      }
    }
  }

  const nodes1 = [];
  for (let i = 0; i < matrix.length; i += 1) {
    const line = matrix[i];
    for (let j = 0; j < line.length; j += 1) {
      const node = line[j];
      nodes1.push(node);
    }
  }

  // eslint-disable-next-line no-console
  // console.log(matrix);


  // correction
  // for (let i = 0; i < nodes.length; i += 1) {
  //   const node = nodes[i];

  // }

  // nodes.sort((a, b) => {
  //   if (a.tag > b.tag) {
  //     return 1;
  //   }
  //   if (a.tag < b.tag) {
  //     return -1;
  //   }
  //   return 0;
  // });

  const NODE_RADIUS = 50;
  for (let i = 0; i < nodes1.length; i += 1) {
    const node = nodes1[i];
    node.peers = undefined;
    node.tag = undefined;
    node.x *= NODE_RADIUS;
    node.y *= NODE_RADIUS;
  }

  const result = { nodes, wires };

  callback('', result);
  return 0;
};

const getSchema = (schemaName, callback) => {
  setTimeout(() => {
    getSchema1(schemaName, callback);
  }, 0);
};

const getNodeSchemeCoordinates = (schemaName, callback) => {
  DbNetNodeShema
    .find({ schemaName })
    .select({ nodeName: 1, x: 1, y: 1, _id: 0 })
    .limit(10000)
    .exec((err, schemaNodes) => {
      callback(err, schemaNodes);
    });
};

const GetSchema = (schemaName, callback) => {
  async.parallel({
    schema: getSchema.bind(null, schemaName),
    coordinates: getNodeSchemeCoordinates.bind(null, schemaName),
  }, (err, result) => {
    if (err) {
      callback(err, result);
      return;
    }

    if (result.coordinates.length === 0) {
      // use default coordinates!
      // const NODE_LEP_WIDTH = 100;
      // const NODE_LEP_HEIGHT = 6;
      // const NODE_LEP_Y_OFFSET = 10;
      // const NODE_PS_RADIUS = 10;

      // let x = 0;
      // let y = 0;
      // for (let i = 0; i < result.schema.nodes.length; i += 1) {
      //   const node = result.schema.nodes[i];
      //   switch (node.nodeType) {
      //     case myNodeType.LEP: {
      //       x += NODE_LEP_WIDTH + 30;
      //       if (x > 2900) {
      //         x = 0;
      //         y += NODE_LEP_HEIGHT + NODE_LEP_Y_OFFSET + 20;
      //       }
      //       break;
      //     }

      //     case myNodeType.PS: {
      //       x += NODE_PS_RADIUS + 30;
      //       if (x > 2900) {
      //         x = 0;
      //         y += NODE_PS_RADIUS + 20;
      //       }
      //       break;
      //     }
      //     default: {
      //       x += 50;
      //       if (x > 2900) {
      //         x = 0;
      //         y += 50;
      //       }
      //     }
      //   }

      //   node.x = x;
      //   node.y = y;
      // }
    } else {
      for (let i = 0; i < result.schema.nodes.length; i += 1) {
        const node = result.schema.nodes[i];
        for (let j = 0; j < result.coordinates.length; j += 1) {
          const schemaNode = result.coordinates[j];
          if (node.name === schemaNode.nodeName) {
            node.x = schemaNode.x;
            node.y = schemaNode.y;
            break;
          }
        }
      }
    }


//    console.log(result.schema, result.coordinates);

    callback(null, result.schema);
  });
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

function loadNodeLists(cb) {
  DbNodeList.find({}, null, { sort: { name: 1 } }, (err, dbNodeLists) => {
    if (err) return cb(err);

    dbNodeLists.forEach((list) => {
      let nodeNames = [];
      if (list.paramNames) {
        nodeNames = list.paramNames.split(',');
      }

      const nodes = [];
      nodeNames.forEach((nodeName) => {
        if (!nodes.has(nodeName)) {
          setError(`cannot find node "${nodeName}" in "${list.name}"`);
        } else {
          nodes.push(nodes.get(nodeName));
        }
      });


      const nl = new MyNodeList(list.name,
        list.caption,
        list.description,
        nodes);

      nodeLists.set(list.name, nl);
    });
    return cb();
  });
}

function createNodeListsForRegions(cb) {
  const locPSs = Array.from(PSs.values());
  const locRegions = Array.from(Regions.values());

  for (let i = 0; i < locRegions.length; i += 1) {
    const region = locRegions[i];
    const nodes = [];

    for (let j = 0; j < locPSs.length; j += 1) {
      const ps = locPSs[j];
      if (ps.parentNode) {
        if (ps.parentNode.name === region.name) {
          if (nodes.indexOf(ps) < 0) {
            nodes.push(ps);
          }

          for (let k = 0; k < ps.lep2psConnectors.length; k += 1) {
            const lep2ps = ps.lep2psConnectors[k];

            if (lep2ps.parentNode) {
              const lep = lep2ps.parentNode;

              if (nodes.indexOf(lep) < 0) {
                nodes.push(lep);
              }
            }
          }
        }
      }
    }

    const nl = new MyNodeList(`nodes_of_${region.name}`,
      region.caption,
      region.description,
      nodes);
    nodeLists.set(nl.name, nl);
  }
  return cb();
}

module.exports.LoadFromDB = LoadFromDB;
module.exports.RelinkParamNamesToNodes = RelinkParamNamesToNodes;
module.exports.SetStateChangedHandler = SetStateChangedHandler;
module.exports.SetManualStates = SetManualStates;
module.exports.GetNode = GetNode;
module.exports.ExportPSs = ExportPSs;
module.exports.GetNodeLists = GetNodeLists;
module.exports.GetRegions = GetRegions;
module.exports.GetSchemaPSs = GetSchemaPSs;
module.exports.GetPSForJson = GetPSForJson;
module.exports.GetSchema = GetSchema;
module.exports.GetParamsListsForEachPS = GetParamsListsForEachPS;
module.exports.StoreLastStateValues = StoreLastStateValues;
