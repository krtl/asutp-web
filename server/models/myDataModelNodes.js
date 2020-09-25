/* eslint max-len: ["error", { "code": 300 }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

let logger;
if (process.env.LOGGER_SHMEMA == "external_service") {
  logger = require("../logger");
} else {
  logger = require("../logger_to_file");
}

const fs = require("fs");
const moment = require("moment");
const async = require("async");
const events = require("events");
const config = require("../../config");
const { MyNodeJsonSerialize } = require("./myNode");

const myNodeType = require("./myNodeType");

const DbParam = require("../dbmodels/param"); // eslint-disable-line global-require

const DbNode = require("../dbmodels/node");
const DbNodeRegion = require("../dbmodels/nodeRegion");
const DbNodeLEP = require("../dbmodels/nodeLEP");
const DbNodeLEP2LEPConnection = require("../dbmodels/nodeLEP2LEPConnection");
const DbNodeLEP2PSConnection = require("../dbmodels/nodeLEP2PSConnection");
const DbNodePS = require("../dbmodels/nodePS");
const DbNodePSPart = require("../dbmodels/nodePSPart");
const DbNodeTransformer = require("../dbmodels/nodeTransformer");
const DbNodeTransformerConnector = require("../dbmodels/nodeTransformerConnector");
const DbNodeSection = require("../dbmodels/nodeSection");
const DbNodeSectionConnector = require("../dbmodels/nodeSectionConnector");
const DbNodeSec2SecConnector = require("../dbmodels/nodeSec2SecConnector");
const DbNodeEquipment = require("../dbmodels/nodeEquipment");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");

const MyParam = require("./myParam");
const MyNode = require("./myNode");
const MyNodeRegion = require("./myNodeRegion");
const MyNodeLEP = require("./myNodeLEP");
const MyNodeLEP2LEPConnection = require("./myNodeLEP2LEPConnection");
const MyNodeLEP2PSConnection = require("./myNodeLEP2PSConnection");
const MyNodePS = require("./myNodePS");
const MyNodePSPart = require("./myNodePSPart");
const MyNodeTransformer = require("./myNodeTransformer");
const MyNodeTransformerConnector = require("./myNodeTransformerConnector");
const MyNodeSection = require("./myNodeSection");
const MyNodeSectionConnector = require("./myNodeSectionConnector");
const MyNodeSec2SecConnector = require("./myNodeSec2SecConnector");
const MyNodeEquipment = require("./myNodeEquipment");

const MyNodePropNameParamRole = require("./MyNodePropNameParamRole");

const params = new Map();
const nodes = new Map();
const Regions = new Map();
const LEPs = new Map();
const PSs = new Map();

const Shema = [
  [DbNodeRegion, MyNodeRegion],
  [DbNodeLEP, MyNodeLEP],
  [DbNodeLEP2LEPConnection, MyNodeLEP2LEPConnection],
  [DbNodeLEP2PSConnection, MyNodeLEP2PSConnection],
  [DbNodePS, MyNodePS],
  [DbNodePSPart, MyNodePSPart],
  [DbNodeTransformer, MyNodeTransformer],
  [DbNodeTransformerConnector, MyNodeTransformerConnector],
  [DbNodeSection, MyNodeSection],
  [DbNodeSectionConnector, MyNodeSectionConnector],
  [DbNodeSec2SecConnector, MyNodeSec2SecConnector],
  [DbNodeEquipment, MyNodeEquipment],
];

let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[ModelNodes] ${text}`);
  // eslint-disable-next-line no-console
  console.error(text);
}

function setWarning(text) {
  // errs += 1;
  logger.warn(`[ModelNodes] ${text}`);
}

process
  .on("unhandledRejection", (reason, p) => {
    const s = `Unhandled Rejection at Promise: ${reason}  ${p}`;
    setError(s);
    // eslint-disable-next-line no-console
    console.error(s);
    process.exit(1);
  })
  .on("uncaughtException", (err) => {
    const s = `Uncaught Exception thrown: ${err.message} \r\n callstack: ${err.stack}`;
    setError(s);
    // eslint-disable-next-line no-console
    console.error(s);
    process.exit(1);
  });

const LoadFromDB = (cb) => {
  const start = moment();
  errs = 0;
  async.series(
    [
      clearData,
      loadParams,
      loadNodes,
      replaceNamesWithObjects,
      linkNodes,
      preparePSs,
      prepareLEPs,
      checkIntegrity,
      linkParamNamesToNodes,
    ],
    () => {
      let res = null;
      if (errs === 0) {
        const duration = moment().diff(start);
        logger.info(
          `[ModelNodes] loaded from DB with ${nodes.size} Nodes in ${moment(
            duration
          ).format("mm:ss.SSS")}`
        );

        // eslint-disable-next-line no-console
        console.debug(
          `[ModelNodes] loaded with ${nodes.size} nodes in ${moment(duration).format("mm:ss.SSS")}`
        );
      } else {
        res = Error(`loading nodes failed with ${errs} errors!`);
        logger.error(res.message);
      }

      return cb(res);
    }
  );
};

function clearData(cb) {
  params.clear();
  nodes.clear();
  Regions.clear();
  LEPs.clear();
  PSs.clear();

  return cb();
}

function loadParams(cb) {
  DbParam.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((prm) => {
      const p = new MyParam(
        prm._id,
        prm.name,
        prm.caption,
        prm.description,
        prm.trackAllChanges,
        prm.trackAveragePerHour
      );
      params.set(prm.name, p);
    });
    return cb();
  });
}

function loadNodes(callback) {
  events.EventEmitter.defaultMaxListeners = 125;
  async.eachSeries(
    Shema,
    (schemeElement, callback) => {
      loadNodesFromDB(schemeElement, callback);
    },
    (err) => {
      if (err) {
        // setError(`loading failed: ${err}`);
      } else {
        //
      }
      callback(err);
    },
    (err) => {
      callback(err);
    }
  );
}

function loadNodesFromDB(schemeElement, cb) {
  const DbNodeObj = schemeElement[0];
  const MyNodeObj = schemeElement[1];
  DbNodeObj.find({}, null, { sort: { name: 1 } }, (err, objcts) => {
    if (err) return cb(err);
    async.eachLimit(
      objcts,
      100,
      (dbNodeObj, callback) => {
        DbNode.findOne(
          {
            name: dbNodeObj.name,
          },
          (err, locNode) => {
            if (err) {
              setError(err.message);
              callback(err);
            } else if (locNode) {
              let locParentNode = null;
              if (nodes.has(locNode.parentNode)) {
                locParentNode = nodes.get(locNode.parentNode);
              }
              const p = new MyNodeObj(
                locNode.name,
                locNode.caption,
                locNode.description
              );
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
                  setError(
                    `Node Ojbect "${dbNodeObj.name}" has no property "${pName}"!`
                  );
                }
              }

              switch (DbNodeObj.nodeType) {
                case myNodeType.REGION: {
                  Regions.set(locNode.name, p);
                  break;
                }
                case myNodeType.LEP: {
                  LEPs.set(locNode.name, p);
                  break;
                }
                case myNodeType.PS: {
                  PSs.set(locNode.name, p);
                  break;
                }
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
          }
        );
        return false;
      },
      (err) => {
        cb(err);
      }
    );
    return false;
  });
}

function getPSForJson(ps) {
  const locPS = new MyNodePS(ps.name, ps.caption, ps.description);
  locPS.parentNode = ps.parentNode.name;
  locPS.sapCode = ps.sapCode;
  ps.transformers.forEach((transformer) => {
    const locTransformer = new MyNodeTransformer(
      transformer.name,
      transformer.caption,
      transformer.description
    );
    locPS.transformers.push(locTransformer);
    locTransformer.sapCode = transformer.sapCode;
    transformer.transConnectors.forEach((transConnector) => {
      const locTransConnector = new MyNodeTransformerConnector(
        transConnector.name,
        transConnector.caption,
        transConnector.description
      );
      locTransConnector.toConnector = transConnector.toConnector.name;
      locTransformer.transConnectors.push(locTransConnector);
    });
  });
  ps.psparts.forEach((pspart) => {
    const locPSPart = new MyNodePSPart(
      pspart.name,
      pspart.caption,
      pspart.description
    );
    locPS.psparts.push(locPSPart);
    locPSPart.sapCode = pspart.sapCode;
    locPSPart.voltage = pspart.voltage;
    pspart.sections.forEach((section) => {
      const locSection = new MyNodeSection(
        section.name,
        section.caption,
        section.description
      );
      locPSPart.sections.push(locSection);
      locSection.sapCode = section.sapCode;
      locSection[MyNodePropNameParamRole.VOLTAGE] =
        section[MyNodePropNameParamRole.VOLTAGE];
      section.connectors.forEach((connection) => {
        const locConnector = new MyNodeSectionConnector(
          connection.name,
          connection.caption,
          connection.description
        );
        locSection.connectors.push(locConnector);
        locConnector.sapCode = connection.sapCode;
        locConnector.cellNumber = connection.cellNumber;
        locConnector[MyNodePropNameParamRole.POWER] =
          connection[MyNodePropNameParamRole.POWER];
        connection.equipments.forEach((equipment) => {
          const locEquipment = new MyNodeEquipment(
            equipment.name,
            equipment.caption,
            equipment.description
          );
          locConnector.equipments.push(locEquipment);
          locEquipment.sapCode = equipment.sapCode;
          locEquipment.equipmentType = equipment.equipmentType;
          locEquipment[MyNodePropNameParamRole.STATE] =
            equipment[MyNodePropNameParamRole.STATE];
        });
      });
    });

    pspart.sec2secConnectors.forEach((connection) => {
      const locConnector = new MyNodeSec2SecConnector(
        connection.name,
        connection.caption,
        connection.description
      );
      locPSPart.sec2secConnectors.push(locConnector);
      locConnector.fromSection = connection.fromSection.name;
      locConnector.toSection = connection.toSection.name;
      locConnector.cellNumber = connection.cellNumber;
      locConnector[MyNodePropNameParamRole.POWER] =
        connection[MyNodePropNameParamRole.POWER];
      connection.equipments.forEach((equipment) => {
        const locEquipment = new MyNodeEquipment(
          equipment.name,
          equipment.caption,
          equipment.description
        );
        locConnector.equipments.push(locEquipment);
        locEquipment.sapCode = equipment.sapCode;
        locEquipment.equipmentType = equipment.equipmentType;
        locEquipment[MyNodePropNameParamRole.STATE] =
          equipment[MyNodePropNameParamRole.STATE];
      });
    });
  });

  return locPS;
}

function ExportPSs(callback) {
  async.eachLimit(
    PSs,
    100,
    (locNodePair, callback) => {
      const ps = locNodePair[1];
      const json = MyNodeJsonSerialize(getPSForJson(ps));

      fs.writeFile(
        `${config.exportPath}${ps.name}.json`,
        json,
        "utf8",
        (err) => {
          if (err) {
            setError(err.message);
            // console.error(`Failed! Error: ${err}`);
          } else {
            // console.info('FileWriteDone!');
          }
          callback(err);
        }
      );
    },
    (err) => {
      callback(err);
    }
  );
}

function replaceNamesWithObjects(callback) {
  // linking names to objects
  async.eachLimit(
    Shema,
    100,
    (schemeElement, callback) => {
      const DbNodeObj = schemeElement[0];
      let err = null;
      const convertToObjProps = DbNodeObj.convertToObj;
      if (convertToObjProps && convertToObjProps.length > 0) {
        const locNodes = Array.from(nodes.values());
        for (let i = 0; i < locNodes.length; i += 1) {
          const locNode = locNodes[i];
          if (locNode.nodeType === DbNodeObj.nodeType) {
            for (let j = 0; j < convertToObjProps.length; j += 1) {
              const pName = convertToObjProps[j];
              const hasProperty = pName in locNode;
              if (hasProperty) {
                if (nodes.has(locNode[pName])) {
                  const nodeItem = locNode; // unwarn eslint
                  nodeItem[pName] = nodes.get(locNode[pName]);
                } else {
                  err = Error(
                    `Cannot convert Name to Object on "${locNode.name}". Node Ojbect "${locNode[pName]}" does not exists in loaded nodes!`
                  );
                  setError(err.message);
                }
              } else {
                err = Error(
                  `Cannot convert Name to Object. There is no property with Node "${pName}"!`
                );
                setError(err.message);
              }
            }
          }
        }
      }
      callback(err);
    },
    (err) => {
      if (err) {
        // setError(`replacing failed: ${err}`);
      } else {
        //
      }
      callback(err);
    },
    (err) => {
      callback(err);
    }
  );
}

function linkLEP2LEPConnectorToLEP(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.LEP) {
      node.parentNode.lep2lepConnectors.push(node);
    } else {
      setError(
        `Failed to link LEP2LEPConnector. There is no parent LEP for ${node.name}`
      );
    }
  }
}

function linkLEP2PSConnectorToLepAndToPS(lep2psConnector) {
  if (lep2psConnector.parentNode) {
    if (lep2psConnector.parentNode.nodeType === myNodeType.LEP) {
      const lep = lep2psConnector.parentNode;
      lep.lep2psConnectors.push(lep2psConnector);
    } else {
      setError(
        `Failed to link LEP2PSConnector. There is no parent LEP for ${lep2psConnector.name}`
      );
    }
  }

  if (lep2psConnector.toNodeConnector) {
    if (
      lep2psConnector.toNodeConnector.nodeType === myNodeType.SECTIONCONNECTOR
    ) {
      const section = lep2psConnector.toNodeConnector.parentNode;
      if (section.parentNode) {
        if (section.parentNode.nodeType === myNodeType.PSPART) {
          const pspart = section.parentNode;
          if (pspart.parentNode) {
            if (pspart.parentNode.nodeType === myNodeType.PS) {
              const ps = pspart.parentNode;
              ps.lep2psConnectors.push(lep2psConnector);
              lep2psConnector.toNodeConnector.lep2PsConnector = lep2psConnector;
            } else {
              setError(
                `Failed to link LEPConnector: ${lep2psConnector.name}. toNodeConnector Owner is not PS`
              );
            }
          } else {
            setError(
              `Failed to link LEPConnector: ${lep2psConnector.name}. There is no parent node for ${pspart.name}`
            );
          }
        } else {
          setError(
            `Failed to link LEPConnector: ${lep2psConnector.name}. toNodeConnector Owner is not PS`
          );
        }
      } else {
        setError(
          `Failed to link LEPConnector: ${lep2psConnector.name}. There is no parent node for ${section.name}`
        );
      }
    } else {
      setError(
        `Failed to link LEP2PSConnector: ${lep2psConnector.name}. toNodeConnector is not a SECTIONCONNECTOR`
      );
    }
  } else {
    setError(
      `Failed to link LEP2PSConnector: ${lep2psConnector.name}. There is no Node to connect.`
    );
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
        setError(
          `Failed to link transformer ${node.name}. Owner PS is not found.`
        );
      }
    } else {
      setError(
        `Failed to link transformer. There is no parent for ${node.name}`
      );
    }
  }
}

function linkSectionToPSPart(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.PSPART) {
      node.parentNode.sections.push(node);
    } else {
      setError(
        `Failed to link section. There is no parent PSPart for ${node.name}`
      );
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
      node.parentNode.sec2secConnectors.push(node);
    } else {
      setError(
        `Failed to link Sec2SecConnector. There is no parent PSPart for ${node.name}`
      );
    }
  }
}

function linkSectionConnectorToSection(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.SECTION) {
      node.parentNode.connectors.push(node);
    } else {
      setError(
        `Failed to link SectionConnector. There is no parent Section for ${node.name}`
      );
    }
  }
}

function linkTransformerConnectorToTransformer(node) {
  if (node.parentNode) {
    if (node.parentNode.nodeType === myNodeType.TRANSFORMER) {
      node.parentNode.transConnectors.push(node);
    } else {
      setError(
        `Failed to link TransformerConnector. There is no parent Transformer for ${node.name}`
      );
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
      setError(
        `Failed to link Equipment. There is no parent Connector for ${node.name}`
      );
    }
  }
}

function linkNodes(cb) {
  const locNodes = Array.from(nodes.values());
  for (let i = 0; i < locNodes.length; i += 1) {
    const locNode = locNodes[i];
    if (locNode.parentNode) {
      switch (locNode.nodeType) {
        case myNodeType.LEP2LEPCONNECTION: {
          linkLEP2LEPConnectorToLEP(locNode);
          break;
        }
        case myNodeType.LEP2PSCONNECTION: {
          linkLEP2PSConnectorToLepAndToPS(locNode);
          break;
        }
        case myNodeType.TRANSFORMER: {
          linkTransformerToPS(locNode);
          break;
        }
        case myNodeType.PSPART: {
          linkPSPartToPS(locNode);
          break;
        }
        case myNodeType.SECTION: {
          linkSectionToPSPart(locNode);
          break;
        }
        case myNodeType.SEC2SECCONNECTOR: {
          linkSec2SecConnectorToPSPart(locNode);
          break;
        }
        case myNodeType.SECTIONCONNECTOR: {
          linkSectionConnectorToSection(locNode);
          break;
        }
        case myNodeType.TRANSFORMERCONNECTOR: {
          linkTransformerConnectorToTransformer(locNode);
          break;
        }
        case myNodeType.EQUIPMENT: {
          linkEquipmentToSectionConnector(locNode);
          break;
        }
        default: {
          //
        }
      }
    }
  }

  return cb();
}

function preparePSs(cb) {
  const locPSs = Array.from(PSs.values());

  const isInTransformerConnector = (ps, con) => {
    for (let i = 0; i < ps.transformers.length; i += 1) {
      const transformer = ps.transformers[i];
      for (let j = 0; j < transformer.transConnectors.length; j += 1) {
        const connector = transformer.transConnectors[j];
        if (connector.toConnector === con) {
          return true;
        }
      }
    }
    return false;
  };

  for (let i = 0; i < locPSs.length; i += 1) {
    const ps = locPSs[i];
    if (ps.psparts.length > 0) {
      let inputPsPart = ps.psparts[0];
      for (let j = 0; j < ps.psparts.length; j += 1) {
        const pspart = ps.psparts[j];
        if (inputPsPart.voltage < pspart.voltage) {
          inputPsPart = pspart;
        }
        for (let k = 0; k < pspart.sections.length; k += 1) {
          const section = pspart.sections[k];
          for (let l = 0; l < section.connectors.length; l += 1) {
            const connector = section.connectors[l];
            connector.transformerConnector = isInTransformerConnector(
              ps,
              connector
            );
          }
        }
      }
      inputPsPart.inputNotOutput = true;

      // input psparts should be at the top (this required for displaying schema on the GUI)
      if (inputPsPart !== ps.psparts[0]) {
        ps.psparts.splice(ps.psparts.indexOf(inputPsPart), 1);
        ps.psparts.unshift(inputPsPart);
      }
    }
  }

  // ..
  return cb();
}

function prepareLEPs(cb) {
  const locLEPs = Array.from(LEPs.values());
  for (let i = 0; i < locLEPs.length; i += 1) {
    const lep = locLEPs[i];
    for (let j = 0; j < lep.lep2lepConnectors.length; j += 1) {
      const connector = lep.lep2lepConnectors[j];

      const peerLep = connector.toNode;
      let exists = false;
      for (let k = 0; k < peerLep.lep2lepConnectors.length; k += 1) {
        const peerConnector = peerLep.lep2lepConnectors[k];
        if (peerConnector.toNode === lep) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const newConnector = new MyNodeLEP2LEPConnection(
          `${connector.name}_peer`,
          connector.caption,
          connector.description
        );
        newConnector.parentNode = peerLep;
        newConnector.toNode = lep;
        peerLep.lep2lepConnectors.push(newConnector);
      }
    }
  }
  return cb();
}

function checkIntegrity(cb) {
  const locLEPs = Array.from(LEPs.values());
  for (let i = 0; i < locLEPs.length; i += 1) {
    const lep = locLEPs[i];
    for (let j = 0; j < lep.lep2lepConnectors.length; j += 1) {
      const lep2lep = lep.lep2lepConnectors[j];
      if (lep2lep.parentNode && lep2lep.toNode) {
        if (lep2lep.parentNode === lep2lep.toNode) {
          setError(
            `Integrity checking error: lep2lep "${lep2lep.name}" has the same parent and toNode.`
          );
        }
      } else {
        setError(
          `Integrity checking error: lep2lep "${lep2lep.name}" has no parent or toNode.`
        );
      }
    }
  }

  const locPSs = Array.from(PSs.values());
  for (let i = 0; i < locPSs.length; i += 1) {
    const locPS = locPSs[i];
    for (let j = 0; j < locPS.psparts.length; j += 1) {
      const locPSPart = locPS.psparts[j];
      if (locPSPart.sections.length === 0) {
        setError(
          `Integrity checking error: PSPart "${locPSPart.name}" has no sections!.`
        );
      } else {
        for (let k = 0; k < locPSPart.sections.length; k += 1) {
          const locSection = locPSPart.sections[k];
          if (locSection.connectors.length === 0) {
            setWarning(
              `Integrity checking error: Section "${locSection.name}" has no connectors!.`
            );
          }
        }
      }
    }

    // if more than one section with the same voltage, they should be connected with Sec2SecConnector
    for (let j = 0; j < locPS.psparts.length; j += 1) {
      const locPSPart = locPS.psparts[j];
      switch (locPSPart.sections.length) {
        case 0: {
          setError(
            `Integrity checking error: No Sections found for ${locPSPart}.`
          );
          break;
        }
        case 1:
          break;
        case 2: {
          if (locPSPart.sec2secConnectors.length === 1) {
            const sec2secCon = locPSPart.sec2secConnectors[0];
            if (
              !(
                (sec2secCon.fromSection === locPSPart.sections[0] &&
                  sec2secCon.toSection === locPSPart.sections[1]) ||
                (sec2secCon.fromSection === locPSPart.sections[1] &&
                  sec2secCon.toSection === locPSPart.sections[0])
              )
            ) {
              setError(
                `Integrity checking error: No section to section connector found for "${locPSPart.sections[0].name}" and "${locPSPart.sections[1].name}" on PS "${locPS.name}"..`
              );
            }
          }
          break;
        }
        case 4: {
          // not yet implemented.
          break;
        }
        default: {
          setWarning(
            `Integrity checking error: Wrong Section number (${locPSPart.sections.length}) on PSPart "${locPSPart.name}". Sections should be connected between eachother.`
          );
          break;
        }
      }
    }

    locPS.transformers.forEach((locTransformer) => {
      if (locTransformer.transConnectors.length === 0) {
        setError(
          `Integrity checking error: Transformer "${locTransformer.name}" has no connectors!.`
        );
      } else if (locTransformer.transConnectors.length < 2) {
        setError(
          `Integrity checking error: Transformer "${locTransformer.name}" should have at least 2 connectors!.`
        );
      } else {
        locTransformer.transConnectors.forEach((locTransConnector) => {
          if (locTransConnector.toConnector === undefined) {
            setError(
              `Integrity checking error: Failed to link Transformer "${locTransformer.name}" to connector "${locTransConnector.toConnector}". No such connector. TransConnector: "${locTransConnector.name}"`
            );
          } else {
            // const section = locTransConnector.toConnector.parentNode;
            // if (!locPS.sections.includes(section)) {
            //   setError(`Integrity checking error: Failed to link Transformer "${locTransformer.name}" to section "${section.name}". The Section is not belongs to the parent PS "${locPS.name}". TransConnector: "${locTransConnector.name}"`);
            // }
          }
        });
      }
    });

    // ..
  }
  // ..
  return cb();
}

function linkParamNamesToNodes(cb) {
  DbNodeParamLinkage.find({}, null, {}, (err, linkages) => {
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
          setError(
            `Node "${locNode.name}" has no property "${dbNodeLinkage.paramPropName}"!`
          );
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

const SetStateChangedHandlers = (
  poweredStateHandler,
  switchedOnStateHandler
) => {
  const locPSs = Array.from(PSs.values());
  for (let i = 0; i < locPSs.length; i += 1) {
    const ps = locPSs[i];
    ps.poweredStateChangeHandler = poweredStateHandler;
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      pspart.poweredStateChangeHandler = poweredStateHandler;
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        section.poweredStateChangeHandler = poweredStateHandler;
        for (let l = 0; l < section.connectors.length; l += 1) {
          const connector = section.connectors[l];
          connector.poweredStateChangeHandler = poweredStateHandler;
          connector.switchedOnStateChangeHandler = switchedOnStateHandler;
          if (connector.lep2PsConnector) {
            connector.lep2PsConnector.parentNode.poweredStateChangeHandler = poweredStateHandler;
          }
          for (let m = 0; m < connector.equipments.length; m += 1) {
            const equipment = connector.equipments[m];
            equipment.poweredStateChangeHandler = poweredStateHandler;
          }
        }
      }

      for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
        const sec2secConnector = pspart.sec2secConnectors[l];
        sec2secConnector.poweredStateChangeHandler = poweredStateHandler;
        sec2secConnector.switchedOnStateChangeHandler = switchedOnStateHandler;
        for (let m = 0; m < sec2secConnector.equipments.length; m += 1) {
          const equipment = sec2secConnector.equipments[m];
          equipment.poweredStateChangeHandler = poweredStateHandler;
        }
      }
    }

    for (let j = 0; j < ps.transformers.length; j += 1) {
      const transformer = ps.transformers[j];
      transformer.poweredStateChangeHandler = poweredStateHandler;
    }
  }
};

function restoreLastPoweredStateValues(callback) {
  if (process.env.RECALCULATION) {
    const start = moment();
    let count = 0;

    const nodes = GetAllNodesAsArray();

    async.eachLimit(
      nodes,
      100,
      (node, callback) => {
        DbNodePoweredStateValue.findOne(
          { nodeName: node.name },
          null,
          { sort: { dt: "desc" } },
          (err, nodeState) => {
            if (err) {
              logger.error(
                `[ModelNodes] Failed to get LastPoweredState value: "${err.message}".`
              );
            } else if (nodeState) {
              node.doOnPoweredStateChanged(nodeState.newState);
              count += 1;
            }

            callback(err);
          }
        );
      },
      (err) => {
        if (err) {
          logger.error(
            `[ModelNodes] ${count} LastPoweredStateValues loaded wirh error: "${err.message}".`
          );
        } else {
          const duration = moment().diff(start);
          logger.info(
            `[ModelNodes] ${count} LastPoweredStateValues loaded in ${moment(
              duration
            ).format("mm:ss.SSS")}`
          );
        }

        callback(err);
      }
    );
  } else {
    callback();
  }
}

// function restoreLastPoweredStateValues(callback) {
//   if (process.env.RECALCULATION) {
//     const start = moment();

//     DbNodePoweredStateValue.aggregate(
//       [
//         { $sort: { nodeName: 1, dt: -1 } },
//         {
//           $group: {
//             _id: "$nodeName",
//             dt: { $first: "$dt" },
//             state: { $first: "$newState" }
//           }
//         }
//       ],
//       (err, states) => {
//         if (err) {
//           callback(err);
//         } else {
//           const duration1 = moment().diff(start);
//           let count = 0;

//           for (let i = 0; i < states.length; i += 1) {
//             const state = states[i];
//             if (nodes.has(state._id)) {
//               const node = nodes.get(state._id);
//               // node.powered = state.state;
//               node.doOnPoweredStateChanged(state.state);
//               count += 1;

//               // console.debug("[]LastPoweredStateValue:", state);
//             } else {
//               logger.warn(
//                 `[ModelNodes][restoreLastPoweredStateValues] failed to find node: ${state._id}`
//               );
//             }
//           }

//           const duration2 = moment().diff(start);
//           logger.debug(
//             `[ModelNodes] ${count} LastPoweredStateValues loaded in ${moment(
//               duration2
//             ).format("mm:ss.SSS")} (aggregation done in ${moment(
//               duration1
//             ).format("mm:ss.SSS")})`
//           );
//           // eslint-disable-next-line no-console
//           console.debug(
//             `[ModelNodes] ${count} LastPoweredStateValues loaded in ${moment(
//               duration2
//             ).format("mm:ss.SSS")} (aggregation done in ${moment(
//               duration1
//             ).format("mm:ss.SSS")})`
//           );

//           callback();
//         }
//       }
//     );
//   } else {
//     callback();
//   }
// }

function restoreLastSwitchedOnStateValues(callback) {
  if (process.env.RECALCULATION) {
    const start = moment();
    let count = 0;

    const allnodes = GetAllNodesAsArray();
    const nodes = [];
    for (let i = 0; i < allnodes.length; i += 1) {
      const node = allnodes[i];
      if (
        node.nodeType === myNodeType.SECTIONCONNECTOR ||
        node.nodeType === myNodeType.SEC2SECCONNECTOR
      ) {
        nodes.push(node);
      }
    }

    async.eachLimit(
      nodes,
      100,
      (node, callback) => {
        DbNodeSwitchedOnStateValue.findOne(
          { connectorName: node.name },
          null,
          { sort: { dt: "desc" } },
          (err, nodeState) => {
            if (err) {
              logger.error(
                `[ModelNodes] Failed to get LastSwitchedOnState value: "${err.message}".`
              );
            } else if (nodeState) {
              node.doOnSwitchedOnStateChanged(nodeState.newState);
              count += 1;
            }

            callback(err);
          }
        );
      },
      (err) => {
        if (err) {
          logger.error(
            `[ModelNodes] ${count} LastSwitchedOnState loaded wirh error: "${err.message}".`
          );
        } else {
          const duration = moment().diff(start);
          logger.info(
            `[ModelNodes] ${count} LastSwitchedOnState loaded in ${moment(
              duration
            ).format("mm:ss.SSS")}`
          );
        }

        callback(err);
      }
    );
  } else {
    callback();
  }
}

// function restoreLastSwitchedOnStateValues(callback) {
//   if (process.env.RECALCULATION) {
//     const start = moment();

//     DbNodeSwitchedOnStateValue.aggregate(
//       [
//         { $sort: { connectorName: 1, dt: -1 } },
//         {
//           $group: {
//             _id: "$connectorName",
//             dt: { $first: "$dt" },
//             state: { $first: "$newState" }
//           }
//         }
//       ],
//       (err, states) => {
//         if (err) {
//           callback(err);
//         } else {
//           const duration1 = moment().diff(start);
//           let count = 0;

//           for (let i = 0; i < states.length; i += 1) {
//             const state = states[i];
//             if (nodes.has(state._id)) {
//               const node = nodes.get(state._id);
//               // node.switchedOn = state.state;
//               node.doOnSwitchedOnStateChanged(state.state);
//               count += 1;

//               // console.debug("[]LastSwitchedOnStateValue:", state);
//             } else {
//               logger.warn(
//                 `[ModelNodes][restoreLastSwitchedOnStateValues] failed to find node: ${state._id}`
//               );
//             }
//           }

//           const duration2 = moment().diff(start);
//           logger.debug(
//             `[ModelNodes] ${count} LastSwitchedOnStateValues loaded in ${moment(
//               duration2
//             ).format("mm:ss.SSS")} (aggregation done in ${moment(
//               duration1
//             ).format("mm:ss.SSS")})`
//           );
//           // eslint-disable-next-line no-console
//           console.debug(
//             `[ModelNodes] ${count} LastSwitchedOnStateValues loaded in ${moment(
//               duration2
//             ).format("mm:ss.SSS")} (aggregation done in ${moment(
//               duration1
//             ).format("mm:ss.SSS")})`
//           );

//           callback();
//         }
//       }
//     );
//   } else {
//     callback();
//   }
// }

const GetPSForJson = (name) => {
  if (PSs.has(name)) {
    const locPS = PSs.get(name);
    return MyNodeJsonSerialize(getPSForJson(locPS));
  }
  return null;
};

const GetParam = (paramName) => params.get(paramName);
const GetNode = (nodeName) => nodes.get(nodeName);
const GetPS = (psName) => PSs.get(psName);
const GetAllNodesAsArray = () => Array.from(nodes.values());
const GetAllParamsAsArray = () => Array.from(params.values());
const GetAllPSsAsArray = () => Array.from(PSs.values());
const GetAllLEPsAsArray = () => Array.from(LEPs.values());
const GetAllRegionsAsArray = () => Array.from(Regions.values());

const RestoreLastValuesFromDB = (cb) => {
  async.series(
    [restoreLastPoweredStateValues, restoreLastSwitchedOnStateValues],
    (err) => {
      if (cb) cb(err);
    }
  );
};

module.exports.LoadFromDB = LoadFromDB;
module.exports.RestoreLastValuesFromDB = RestoreLastValuesFromDB;
module.exports.RelinkParamNamesToNodes = RelinkParamNamesToNodes;
module.exports.SetStateChangedHandlers = SetStateChangedHandlers;
module.exports.GetParam = GetParam;
module.exports.GetNode = GetNode;
module.exports.GetPS = GetPS;
module.exports.ExportPSs = ExportPSs;
module.exports.GetPSForJson = GetPSForJson;
module.exports.GetAllNodesAsArray = GetAllNodesAsArray;
module.exports.GetAllParamsAsArray = GetAllParamsAsArray;
module.exports.GetAllPSsAsArray = GetAllPSsAsArray;
module.exports.GetAllLEPsAsArray = GetAllLEPsAsArray;
module.exports.GetAllRegionsAsArray = GetAllRegionsAsArray;
