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

const DbUser = require("../dbmodels/authUser"); // eslint-disable-line global-require
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");
const DbNodeSchema = require("../dbmodels/nodeSchema");

const myDataModelNodes = require("./myDataModelNodes");

const MyNode = require("./myNode");
const MyNodePS = require("./myNodePS");
const MyNodePSPart = require("./myNodePSPart");
const MyNodeTransformer = require("./myNodeTransformer");
const MyNodeTransformerConnector = require("./myNodeTransformerConnector");
const MyNodeSection = require("./myNodeSection");
const MyNodeSectionConnector = require("./myNodeSectionConnector");
const MyNodeSec2SecConnector = require("./myNodeSec2SecConnector");
const MyNodeEquipment = require("./myNodeEquipment");

const MyNodePropNameParamRole = require("./MyNodePropNameParamRole");

const MySchemeWire = require("./mySchemeWire");
const MyNodeSchema = require("./myNodeSchema");

const users = new Map();
const nodeSchemas = new Map();

let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[ModelSchemas] ${text}`);
  // eslint-disable-next-line no-console
  console.error(text);
}

function setWarning(text) {
  // errs += 1;
  logger.warn(`[ModelSchemas] ${text}`);
}

const LoadFromDB = (cb) => {
  const start = moment();
  errs = 0;
  async.series(
    [
      clearData,
      loadUsers,
      loadSchemas,
      makeSchemaNamesForEachNode,
      makeSchemaNamesForEachParam,
    ],
    () => {
      let res = null;
      if (errs === 0) {
        const duration = moment().diff(start);
        logger.info(
          `[ModelSchemas] loaded from DB with ${
            nodeSchemas.size
          } schemas in ${moment(duration).format("mm:ss.SSS")}`
        );

        // eslint-disable-next-line no-console
        console.debug(
          `[ModelSchemas] loaded from DB with ${
            nodeSchemas.size
          } schemas in ${moment(duration).format("mm:ss.SSS")}`
        );

      } else {
        res = `loading schemas failed with ${errs} errors!`;
        logger.error(res);
      }

      return cb(res);
    }
  );
};

function clearData(cb) {
  users.clear();
  nodeSchemas.clear();

  return cb();
}

function loadUsers(cb) {
  DbUser.find({}, null, { sort: { name: 1 } }, (err, usrs) => {
    if (err) return cb(err);
    usrs.forEach((usr) => {
      users.set(usr.name, usr.might);
    });
    return cb();
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

// const GetNodeSchemas = () => Array.from(nodeSchemas.values());

const GetCustomAndRegionSchemas = () => {
  const result = [];
  const schemas = Array.from(nodeSchemas.values());
  for (let i = 0; i < schemas.length; i += 1) {
    const schema = schemas[i];
    if (!schema.name.startsWith("schema_of_")) {
      result.push(schema);
    }
  }
  return result;
};

const GetSchemaPSs = (schemaName) => {
  const result = [];
  if (nodeSchemas.has(schemaName)) {
    const nodeSchema = nodeSchemas.get(schemaName);
    for (let i = 0; i < nodeSchema.nodes.length; i += 1) {
      const node = nodeSchema.nodes[i];
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
    const locNode = new MyNode(
      node.name,
      node.caption,
      node.description,
      node.nodeType
    );
    locNode.parentNode = node.parentNode.name;
    locNode.sapCode = node.sapCode;
    locNode.powered = node.powered;
    locNode.parentNode = undefined;
    locNode.description = undefined;
    locNode.caption = node.caption;
    locNode.schemaNames = undefined;
    resultNodes.push(locNode);
  }
  return resultNodes;
};

const getSchema1 = (schemaName, callback) => {
  const pss = [];
  const leps = [];
  const wires = [];

  if (!nodeSchemas.has(schemaName)) {
    const error = `Unknown nodeSchema with name= ${schemaName}`;
    // eslint-disable-next-line no-console
    console.error(error);
    const result = { nodes: [], wires };

    callback(Error(error), result);
    return 1;
  }

  const locNodeSchema = nodeSchemas.get(schemaName);
  for (let i = 0; i < locNodeSchema.nodes.length; i += 1) {
    const node = locNodeSchema.nodes[i];
    switch (node.nodeType) {
      case myNodeType.PS: {
        pss.push(node);
        break;
      }
      case myNodeType.LEP: {
        leps.push(node);
        break;
      }
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
          logger.warn(
            `[ModelSchemas][getSchema] added lep: ${lep.name} that should be previously include into NodeSchema: ${locNodeSchema.name}`
          );
        }
      }
      const wire = new MySchemeWire(
        lep2ps.name,
        undefined,
        undefined,
        undefined
      );
      wire.nodeFrom = lep2ps.parentNode.name;
      wire.nodeTo = ps.name;
      wires.push(wire);
    }
  }

  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    for (let j = 0; j < lep.lep2lepConnectors.length; j += 1) {
      const lep2lep = lep.lep2lepConnectors[j];
      if (lep2lep.parentNode && lep2lep.toNode) {
        if (
          leps.indexOf(lep2lep.parentNode) > 0 &&
          leps.indexOf(lep2lep.toNode) > 0
        ) {
          const wire = new MySchemeWire(
            lep2lep.name,
            undefined,
            undefined,
            undefined
          );
          wire.nodeFrom = lep2lep.parentNode.name;
          wire.nodeTo = lep2lep.toNode.name;
          wires.push(wire);
        } else {
          logger.warn(
            `[ModelSchemas][getSchema] failed to find nodes on lep2lep: ${lep2lep.name}`
          );
        }
      }
    }
  }

  const schemaNodes = populateNodesWithMatrixCoordinates(
    getNodeForScheme(leps.concat(pss)),
    wires
  );

  const result = { nodes: schemaNodes, wires };

  callback(undefined, result);
  return 0;
};

const populateNodesWithMatrixCoordinates = (schemaNodes, schemaWires) => {
  for (let i = 0; i < schemaNodes.length; i += 1) {
    const node = schemaNodes[i];
    node.peers = [];
    node.tag = 0;
  }

  for (let i = 0; i < schemaNodes.length; i += 1) {
    const node = schemaNodes[i];
    for (let j = 0; j < schemaWires.length; j += 1) {
      const wire = schemaWires[j];
      if (wire.nodeFrom === node.name) {
        const locNode = schemaNodes.find((nde) => nde.name === wire.nodeTo);
        if (locNode) {
          node.peers.push(locNode);
        }
      }
      if (wire.nodeTo === node.name) {
        const locNode = schemaNodes.find((nde) => nde.name === wire.nodeFrom);
        if (locNode) {
          node.peers.push(locNode);
        }
      }
    }
  }

  // schemaNodes.sort((a, b) => {
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

  for (let i = 0; i < schemaNodes.length; i += 1) {
    const node = schemaNodes[i];
    if (node.peers.length > 0 && node.tag === 0) {
      setPeersNumber(node);
    }
  }

  const matrix = [];
  for (let i = 0; i < matrixNum; i += 1) {
    const line = [];
    for (let j = 0; j < schemaNodes.length; j += 1) {
      const node = schemaNodes[j];
      if (node.tag === i) {
        line.push(node);
      }
    }
    if (line.length > 0) {
      line.sort((a, b) => b.peers.length - a.peers.length);
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
    if (a.length > 0 && b.length > 0) {
      return getPeersCount(b) - getPeersCount(a);
    }
    return 0;
  });

  const WIDTH = 55;
  const HEIGHT = Math.ceil(schemaNodes.length / 50) + 2;

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
      if (i % 2 > 0) {
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
        if (x + j >= WIDTH || y + i >= HEIGHT) {
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
    if (x < WIDTH && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x + dimension.width;
    y = _y - dimension.height;
    if (x < WIDTH && y >= 0 && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x;
    y = _y - dimension.height;
    if (x >= 0 && y >= 0 && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x - dimension.width;
    y = _y - dimension.height;
    if (x >= 0 && y >= 0 && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x - dimension.width;
    y = _y;
    if (x >= 0 && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x - dimension.width;
    y = _y + dimension.height;
    if (x >= 0 && y < HEIGHT && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x;
    y = _y + dimension.height;
    if (x >= 0 && y < HEIGHT && isMatrixPositionFree(dimension, x, y)) {
      return { x, y };
    }
    x = _x + dimension.width;
    y = _y + dimension.height;
    if (x < WIDTH && y < HEIGHT && isMatrixPositionFree(dimension, x, y)) {
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
    // console.warn(`[!]setNextXY error for ${dimension.width}:${dimension.height}`);
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

  return schemaNodes;
};

// ----------------------------------------------------------------

const getSchema = (schemaName, callback) => {
  setTimeout(() => {
    getSchema1(schemaName, callback);
  }, 0);
};

const getPSSchema1 = (psName, callback) => {
  const wires = [];
  const ps = myDataModelNodes.GetPS(psName);

  if (!nodeSchemas.has(`schema_of_${psName}`) || !ps) {
    const error = `Unknown schema with name = schema_of_${psName}`;
    // eslint-disable-next-line no-console
    console.error(error);
    const result = { nodes: [], wires };

    callback(Error(error), result);
    return 1;
  }

  // ps.psparts.sort((p1, p2) => (p2.voltage - p1.voltage));

  const getNewNodeForScheme = (node) => {
    const locNode = new MyNode(
      node.name,
      node.caption,
      node.description,
      node.nodeType
    );
    // locNode.parentNode = node.parentNode.name;
    locNode.sapCode = node.sapCode;
    locNode.powered = node.powered;
    locNode.parentNode = undefined;
    locNode.description = undefined;
    // locNode.caption = node.caption;
    locNode.schemaNames = undefined;
    return locNode;
  };

  // const getConnectorsCount = (line) => {
  //   let result = 0;
  //   for (let i = 0; i < line.length; i += 1) {
  //     const section = line[i];
  //     result += section.connectors.length;
  //   }
  //   return result;
  // };

  const getPSPartVoltage = (line) => {
    if (line.length > 0) {
      const section = line[0];
      return section.parentNode.voltage;
    }
    return 999999;
  };

  const TOP_SECTION_Y = 3;
  const TRANSFORMER_Y = 5;
  const BOTTOM_SECTION_Y = 7;

  const getSectionXY = (
    section,
    sectionsLine1,
    sectionsLine2,
    sectionsLine3
  ) => {
    let maxLine = sectionsLine1;
    // if (getConnectorsCount(maxLine) < getConnectorsCount(sectionsLine2)) maxLine = sectionsLine2;
    // if (getConnectorsCount(maxLine) < getConnectorsCount(sectionsLine3)) maxLine = sectionsLine3;

    // all imputs should be at the top, all outputs should be located at the bottom.

    if (getPSPartVoltage(maxLine) > getPSPartVoltage(sectionsLine2))
      maxLine = sectionsLine2;
    if (getPSPartVoltage(maxLine) > getPSPartVoltage(sectionsLine3))
      maxLine = sectionsLine3;

    let y = TOP_SECTION_Y;
    let x = 0;
    let index = maxLine.indexOf(section);
    if (index > -1) {
      y = BOTTOM_SECTION_Y;
      x = section.connectors.length / 2;
      for (let i = 0; i < index; i += 1) {
        const sec = maxLine[i];
        x += sec.connectors.length + 1;
      }
    }

    if (y === TOP_SECTION_Y) {
      let elseLine = [];
      if (maxLine !== sectionsLine1) {
        elseLine = elseLine.concat(sectionsLine1);
      }
      if (maxLine !== sectionsLine2) {
        elseLine = elseLine.concat(sectionsLine2);
      }
      if (maxLine !== sectionsLine3) {
        elseLine = elseLine.concat(sectionsLine3);
      }

      index = elseLine.indexOf(section);

      if (index < maxLine.length) {
        for (let i = 0; i < index; i += 1) {
          const sec = maxLine[i];
          x += sec.connectors.length + 1;
        }
        const sec = maxLine[index];
        x += sec.connectors.length / 2;
      } else {
        for (let i = 0; i < maxLine.length; i += 1) {
          const sec = maxLine[i];
          x += sec.connectors.length + 1;
        }

        for (let i = maxLine.length; i < index; i += 1) {
          const sec = elseLine[i];
          x += sec.connectors.length + 1;
        }

        x += section.connectors.length / 2;
      }
    }

    return { x, y };
  };

  const getNodeByName = (name, nodes) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.name === name) {
        return node;
      }
    }
    return null;
  };

  const getSec2secXY = (nodes, sec2secConnector) => {
    const section1 = getNodeByName(sec2secConnector.fromSection.name, nodes);
    const section2 = getNodeByName(sec2secConnector.toSection.name, nodes);
    if (section1.x > section2.x) {
      return { x: section2.x + (section1.x - section2.x) / 2, y: section1.y };
    }
    return { x: section1.x + (section2.x - section1.x) / 2, y: section1.y };
  };

  //----------------------------------------------------

  const schemaNodes = [];
  const sectionsLine1 = [];
  const sectionsLine2 = [];
  const sectionsLine3 = [];
  // const paramNames = [];

  for (let i = 0; i < ps.transformers.length; i += 1) {
    const transformer = ps.transformers[i];
    transformer.transConnectors.sort(
      (c1, c2) =>
        c2.toConnector.parentNode.parentNode.voltage -
        c1.toConnector.parentNode.parentNode.voltage
    );
    for (let j = 0; j < transformer.transConnectors.length; j += 1) {
      const transConnector = transformer.transConnectors[j];
      const section = transConnector.toConnector.parentNode;
      if (sectionsLine1.length === 0) {
        sectionsLine1.push(section);
      } else if (
        sectionsLine1.length > 0 &&
        sectionsLine1[0].parentNode.voltage === section.parentNode.voltage
      ) {
        sectionsLine1.push(section);
      } else if (sectionsLine2.length === 0) {
        sectionsLine2.push(section);
      } else if (
        sectionsLine2.length > 0 &&
        sectionsLine2[0].parentNode.voltage === section.parentNode.voltage
      ) {
        sectionsLine2.push(section);
      } else {
        sectionsLine3.push(section);
      }
    }
  }

  // add missed sections
  for (let i = 0; i < ps.psparts.length; i += 1) {
    const pspart = ps.psparts[i];
    for (let j = 0; j < pspart.sections.length; j += 1) {
      const section = pspart.sections[j];
      if (
        sectionsLine1.indexOf(section) < 0 &&
        sectionsLine2.indexOf(section) < 0 &&
        sectionsLine3.indexOf(section) < 0
      ) {
        if (
          sectionsLine1.length > 0 &&
          sectionsLine1[0].parentNode.voltage === section.parentNode.voltage
        ) {
          sectionsLine1.push(section);
        } else if (
          sectionsLine2.length > 0 &&
          sectionsLine2[0].parentNode.voltage === section.parentNode.voltage
        ) {
          sectionsLine2.push(section);
        } else {
          sectionsLine3.push(section);
        }
      }
    }
  }

  // console.log(sectionsLine1);

  for (let i = 0; i < ps.psparts.length; i += 1) {
    const pspart = ps.psparts[i];
    // locNodes.push(pspart);
    for (let j = 0; j < pspart.sections.length; j += 1) {
      const section = pspart.sections[j];
      const section1 = getNewNodeForScheme(section);
      const xy = getSectionXY(
        section,
        sectionsLine1,
        sectionsLine2,
        sectionsLine3
      );
      section1.x = xy.x;
      section1.y = xy.y;
      schemaNodes.push(section1);

      if (section[MyNodePropNameParamRole.VOLTAGE] !== "") {
        const param = myDataModelNodes.GetParam(
          section[MyNodePropNameParamRole.VOLTAGE]
        );
        if (param) {
          const locNode = new MyNode(
            `${section.name}.${MyNodePropNameParamRole.VOLTAGE}`,
            param.caption,
            param.description,
            myNodeType.PARAM
          );
          locNode.parentNode = section.name;
          locNode.sapCode = undefined;
          locNode.powered = undefined; // !
          locNode.parentNode = undefined;
          locNode.description = undefined;
          locNode.schemaNames = undefined;
          locNode.x = section1.x + 1;
          locNode.y = section1.y;
          locNode.paramName = param.name;
          schemaNodes.push(locNode);
        }
      }

      const offsetX = section1.x - section.connectors.length / 2;
      let conOffset = 0;
      for (let k = 0; k < section.connectors.length; k += 1) {
        const connector = section.connectors[k];
        const connector1 = getNewNodeForScheme(connector);
        connector1.switchedOn = connector.switchedOn;

        if (!connector.transformerConnector) conOffset += 1;
        connector1.x = connector.transformerConnector
          ? section1.x
          : offsetX + conOffset;
        if (section1.y === TOP_SECTION_Y) {
          connector1.y = connector.transformerConnector
            ? section1.y + 1
            : section1.y - 1;
        } else {
          connector1.y = connector.transformerConnector
            ? section1.y - 1
            : section1.y + 1;
        }

        schemaNodes.push(connector1);

        const wire = new MySchemeWire(
          connector.name,
          undefined,
          undefined,
          undefined
        );
        wire.nodeFrom = section.name;
        wire.nodeTo = connector.name;
        wires.push(wire);

        if (MyNodePropNameParamRole.POWER in connector) {
          if (connector[MyNodePropNameParamRole.POWER] !== "") {
            const param = myDataModelNodes.GetParam(
              connector[MyNodePropNameParamRole.POWER]
            );
            if (param) {
              const locNode = new MyNode(
                `${connector.name}.${MyNodePropNameParamRole.POWER}`,
                param.caption,
                param.description,
                myNodeType.PARAM
              );
              locNode.parentNode = connector.name;
              locNode.sapCode = undefined;
              locNode.powered = undefined; // !
              locNode.parentNode = undefined;
              locNode.description = undefined;
              locNode.schemaNames = undefined;
              locNode.x = connector1.x;
              locNode.y = connector1.y;
              if (section1.y === TOP_SECTION_Y) {
                if (connector.transformerConnector) {
                  locNode.x = connector1.x + 1;
                  locNode.y = connector1.y;
                } else {
                  locNode.x = connector1.x;
                  locNode.y = connector1.y - 1;
                }
              } else if (connector.transformerConnector) {
                locNode.x = connector1.x + 1;
                locNode.y = connector1.y;
              } else {
                locNode.x = connector1.x;
                locNode.y = connector1.y + 1;
              }
              locNode.paramName = param.name;
              schemaNodes.push(locNode);
            }
          }
        }

        for (let m = 0; m < connector.equipments.length; m += 1) {
          const equipment = connector.equipments[m];
          if (MyNodePropNameParamRole.STATE in equipment) {
            if (equipment[MyNodePropNameParamRole.STATE] !== "") {
              connector1.paramName = equipment[MyNodePropNameParamRole.STATE];
            }
          }
        }

        if (connector.lep2PsConnector) {
          const lep = connector.lep2PsConnector.parentNode;
          const locNode = new MyNode(
            lep.name,
            lep.caption,
            lep.description,
            myNodeType.LEP
          );
          locNode.parentNode = connector.name;
          locNode.sapCode = undefined; // lep.sapCode;
          locNode.powered = lep.powered; // !
          locNode.parentNode = undefined;
          locNode.description = undefined;
          locNode.caption = connector.caption;
          locNode.schemaNames = undefined;
          locNode.x = connector1.x;
          locNode.y = connector1.y;
          if (section1.y === TOP_SECTION_Y) {
            if (connector.transformerConnector) {
              // error: transformer connector could not be connected to a lep!
              // locNode.x = connector1.x + 2;
              // locNode.y = connector1.y;
            } else {
              locNode.x = connector1.x;
              locNode.y = connector1.y - 2;
            }
          } else if (connector.transformerConnector) {
            // error: transformer connector could not be connected to a lep!
            // locNode.x = connector1.x + 2;
            // locNode.y = connector1.y;
          } else {
            locNode.x = connector1.x;
            locNode.y = connector1.y + 2;
          }
          locNode.paramName = undefined;
          schemaNodes.push(locNode);

          const wire = new MySchemeWire(
            lep.name,
            undefined,
            undefined,
            undefined
          );
          wire.nodeFrom = connector.name;
          wire.nodeTo = lep.name;
          wires.push(wire);
        }
      }
    }

    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const sec2secConnector = pspart.sec2secConnectors[l];
      const sec2secConnector1 = getNewNodeForScheme(sec2secConnector);
      sec2secConnector1.switchedOn = sec2secConnector.switchedOn;

      const xy = getSec2secXY(schemaNodes, sec2secConnector);
      sec2secConnector1.x = xy.x;
      sec2secConnector1.y = xy.y;
      schemaNodes.push(sec2secConnector1);

      for (let m = 0; m < sec2secConnector.equipments.length; m += 1) {
        const equipment = sec2secConnector.equipments[m];
        if (MyNodePropNameParamRole.STATE in equipment) {
          if (equipment[MyNodePropNameParamRole.STATE] !== "") {
            sec2secConnector1.paramName =
              equipment[MyNodePropNameParamRole.STATE];
          }
        }
      }

      const wire = new MySchemeWire(
        `${sec2secConnector.name}1`,
        undefined,
        undefined,
        undefined
      );
      wire.nodeFrom = sec2secConnector.fromSection.name;
      wire.nodeTo = sec2secConnector.name;
      wires.push(wire);

      const wire1 = new MySchemeWire(
        `${sec2secConnector.name}2`,
        undefined,
        undefined,
        undefined
      );
      wire1.nodeFrom = sec2secConnector.name;
      wire1.nodeTo = sec2secConnector.toSection.name;
      wires.push(wire1);

      // if (MyNodePropNameParamRole.POWER in connector) {
      //   if (connector[MyNodePropNameParamRole.POWER] !== '') {
      //     pushIfNotPushed(paramNames, connector[MyNodePropNameParamRole.POWER]);
      //   }
      // }

      for (let m = 0; m < sec2secConnector.equipments.length; m += 1) {
        const equipment = sec2secConnector.equipments[m];
        if (MyNodePropNameParamRole.STATE in equipment) {
          if (equipment[MyNodePropNameParamRole.STATE] !== "") {
            sec2secConnector1.paramName =
              equipment[MyNodePropNameParamRole.STATE];
          }
        }
      }
    }
  }

  for (let i = 0; i < ps.transformers.length; i += 1) {
    const transformer = ps.transformers[i];
    const transformer1 = getNewNodeForScheme(transformer);
    transformer1.x = 0;
    transformer1.y = TRANSFORMER_Y;
    schemaNodes.push(transformer1);

    for (let j = 0; j < transformer.transConnectors.length; j += 1) {
      const transConnector = transformer.transConnectors[j];

      if (transformer1.x === 0) {
        const connector1 = getNodeByName(
          transConnector.toConnector.name,
          schemaNodes
        );
        transformer1.x = connector1.x;
      }

      const wire = new MySchemeWire(
        transConnector.name,
        undefined,
        undefined,
        undefined
      );
      wire.nodeFrom = transformer.name;
      wire.nodeTo = transConnector.toConnector.name;
      wires.push(wire);
    }
  }

  const NODE_RADIUS = 50;
  for (let i = 0; i < schemaNodes.length; i += 1) {
    const node = schemaNodes[i];
    // node.tag = undefined;
    node.x *= NODE_RADIUS * 1.7;
    node.y *= NODE_RADIUS;
  }

  const result = { nodes: schemaNodes, wires };

  callback(undefined, result);
  return 0;
};

const getPSSchema = (psName, callback) => {
  setTimeout(() => {
    getPSSchema1(psName, callback);
  }, 0);
};
const getNodeSchemeCoordinates = (schemaName, callback) => {
  DbNodeCoordinates.find({ schemaName })
    .select({
      nodeName: 1,
      x: 1,
      y: 1,
      _id: 0,
    })
    .limit(10000)
    .exec((err, schemaNodes) => {
      callback(err, schemaNodes);
    });
};

const GetSchema = (schemaName, callback) => {
  async.parallel(
    {
      schema: getSchema.bind(null, schemaName),
      coordinates: getNodeSchemeCoordinates.bind(null, schemaName),
    },
    (err, result) => {
      if (err) {
        callback(err, result);
        return;
      }

      if (result.coordinates.length === 0) {
        // use default coordinates!
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
    }
  );
};

const GetPSSchema = (psName, callback) => {
  async.parallel(
    {
      schema: getPSSchema.bind(null, psName),
      coordinates: getNodeSchemeCoordinates.bind(null, psName),
    },
    (err, result) => {
      if (err) {
        callback(err, result);
        return;
      }

      if (result.coordinates.length === 0) {
        // use default coordinates!
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
    }
  );
};

function pushIfNotPushed(array, element) {
  if (array.indexOf(element) < 0) {
    array.push(element);
  }
}

function loadSchemas(cb) {
  if (process.env.RECALCULATION) {
    return cb();
  }

  DbNodeSchema.find({}, null, { sort: { name: 1 } }, (err, dbNodeSchemas) => {
    if (err) return cb(err);

    dbNodeSchemas.forEach((schema) => {
      const obj = createMyNodeSchemaObj(schema);
      nodeSchemas.set(obj.name, obj);
    });
    return cb();
  });
}

function ReloadCustomSchema(schemaName, cb) {
  DbNodeSchema.findOne({ name: schemaName }, (err, schema) => {
    if (err) return cb(err);

    const obj = createMyNodeSchemaObj(schema);

    if (nodeSchemas.has(obj.name)) {
      nodeSchemas.delete(obj.name);
    }
    nodeSchemas.set(obj.name, obj);

    return cb();
  });
}

function DeleteCustomSchema(schemaName, cb) {
  if (
    schemaName.startsWith("nodes_of_") ||
    schemaName.startsWith("schema_of_")
  ) {
    return cb(Error(`Schema "${schemaName}" cannot be removed.`));
  } else {
    DbNodeSchema.findOneAndRemove({ name: schemaName }, (err, schema) => {
      if (err) return cb(err);

      if (nodeSchemas.has(schemaName)) {
        nodeSchemas.delete(schemaName);
      }
      return cb();
    });
  }
}

function CustomSchemaAddNode(schemaName, nodeName, cb) {
  if (
    schemaName.startsWith("nodes_of_") ||
    schemaName.startsWith("schema_of_")
  ) {
    return cb(Error(`Schema "${schemaName}" cannot be edited.`));
  } else {
    DbNodeSchema.findOne({ name: schemaName }, (err, dbSchema) => {
      if (err) return cb(err);

      if (nodeSchemas.has(schemaName) && dbSchema) {
        const locSchema = nodeSchemas.get(schemaName);
        const locNode = myDataModelNodes.GetNode(nodeName);
        if (locNode) {
          if (locSchema.nodes.indexOf(locNode) < 0) {
            locSchema.nodes.push(locNode);
            let locNodeNames = [];
            if (dbSchema.nodeNames) {
              locNodeNames = dbSchema.nodeNames.split(",");
            }
            if (locNodeNames.indexOf(locNode.name) < 0) {
              locNodeNames.push(locNode.name);
              DbNodeSchema.updateOne(
                { _id: dbSchema.id },
                {
                  $set: {
                    nodeNames: locNodeNames.sort().join(","),
                  },
                },
                (err) => {
                  if (err) return cb(err);

                  logger.info(`updated schema ${schemaName}`);

                  return cb();
                }
              );
            } else return cb();
          } else return cb();
        } else return cb(Error(`Node "${nodeName}" does not exists.`));
      } else return cb(Error(`Schema "${schemaName}" does not exists.`));
    });
  }
}

function CustomSchemaDeleteNode(schemaName, nodeName, cb) {
  if (
    schemaName.startsWith("nodes_of_") ||
    schemaName.startsWith("schema_of_")
  ) {
    return cb(Error(`Schema "${schemaName}" cannot be edited.`));
  } else {
    DbNodeSchema.findOne({ name: schemaName }, (err, dbSchema) => {
      if (err) return cb(err);

      if (nodeSchemas.has(schemaName) && dbSchema) {
        const locSchema = nodeSchemas.get(schemaName);
        const locNode = myDataModelNodes.GetNode(nodeName);
        if (locNode) {
          const i1 = locSchema.nodes.indexOf(locNode);
          if (i1 > -1) {
            locSchema.nodes.splice(i1, 1);
            let locNodeNames = [];
            if (dbSchema.nodeNames) {
              locNodeNames = dbSchema.nodeNames.split(",");
            }
            const i2 = locNodeNames.indexOf(locNode.name);
            if (i2 > -1) {
              locNodeNames.splice(i2, 1);
              DbNodeSchema.updateOne(
                { _id: dbSchema.id },
                {
                  $set: {
                    nodeNames: locNodeNames.sort().join(","),
                  },
                },
                (err) => {
                  if (err) return cb(err);

                  logger.info(`updated schema ${schemaName}`);

                  return cb();
                }
              );
            } else return cb();
          } else return cb();
        } else return cb(Error(`Node "${nodeName}" does not exists.`));
      } else return cb(Error(`Schema "${schemaName}" does not exists.`));
    });
  }
}

function createMyNodeSchemaObj(dbSchema) {
  let nodeNames = [];
  if (dbSchema.nodeNames) {
    nodeNames = dbSchema.nodeNames.split(",");
  }
  locNodes = [];
  nodeNames.forEach((nodeName) => {
    if (nodeName != "") {
      const node = myDataModelNodes.GetNode(nodeName);
      if (!node) {
        setWarning(
          `[ModelSchemas][loadNodeSchemas] Cannot find node "${nodeName}" in "${dbSchema.name}"`
        );
      } else {
        locNodes.push(node);
      }
    }
  });

  let prmNames = [];
  if (dbSchema.paramNames) {
    prmNames = dbSchema.paramNames.split(",");
  }
  prmNames.forEach((prmName) => {
    const param = myDataModelNodes.GetParam(prmName);
    if (!param) {
      setWarning(
        `[ModelSchemas][loadNodeSchemas] Cannot find param "${prmName}" in "${dbSchema.name}"`
      );
    }
  });

  const obj = new MyNodeSchema(
    dbSchema.name,
    dbSchema.caption,
    dbSchema.description,
    locNodes,
    prmNames
  );

  return obj;
}

function CreateNodeSchemasForRegions() {
  let schemas = [];

  const locPSs = myDataModelNodes.GetAllPSsAsArray();
  const locRegions = myDataModelNodes.GetAllRegionsAsArray();

  for (let i = 0; i < locRegions.length; i += 1) {
    const region = locRegions[i];
    const locNodeNames = [];

    for (let j = 0; j < locPSs.length; j += 1) {
      const ps = locPSs[j];
      if (ps.parentNode) {
        if (ps.parentNode.name === region.name) {
          if (locNodeNames.indexOf(ps.name) < 0) {
            locNodeNames.push(ps.name);
          }

          for (let k = 0; k < ps.lep2psConnectors.length; k += 1) {
            const lep2ps = ps.lep2psConnectors[k];

            if (lep2ps.parentNode) {
              const lep = lep2ps.parentNode;

              if (locNodeNames.indexOf(lep.name) < 0) {
                locNodeNames.push(lep.name);
              }
            }
          }
        }
      }
    }

    const nl = new MyNodeSchema(
      `nodes_of_${region.name}`,
      region.caption,
      region.description,
      undefined,
      undefined
    );
    nl.nodeNames = locNodeNames.sort().join(",");
    schemas.push(nl);
  }

  return schemas;
}

function CreatePSSchema(ps) {
  const locNodeNames = [];
  const paramNames = [];

  for (let j = 0; j < ps.transformers.length; j += 1) {
    const transformer = ps.transformers[j];
    locNodeNames.push(transformer.name);
  }

  for (let j = 0; j < ps.psparts.length; j += 1) {
    const pspart = ps.psparts[j];
    // locNodeNames.push(pspart.name);
    for (let k = 0; k < pspart.sections.length; k += 1) {
      const section = pspart.sections[k];
      locNodeNames.push(section.name);
      if (section[MyNodePropNameParamRole.VOLTAGE] !== "") {
        pushIfNotPushed(paramNames, section[MyNodePropNameParamRole.VOLTAGE]);
      }

      for (let l = 0; l < section.connectors.length; l += 1) {
        const connector = section.connectors[l];
        locNodeNames.push(connector.name);
        if (MyNodePropNameParamRole.POWER in connector) {
          if (connector[MyNodePropNameParamRole.POWER] !== "") {
            pushIfNotPushed(
              paramNames,
              connector[MyNodePropNameParamRole.POWER]
            );
          }
        }
        for (let m = 0; m < connector.equipments.length; m += 1) {
          const equipment = connector.equipments[m];
          // locNodeNames.push(equipment.name);
          if (MyNodePropNameParamRole.STATE in equipment) {
            if (equipment[MyNodePropNameParamRole.STATE] !== "") {
              pushIfNotPushed(
                paramNames,
                equipment[MyNodePropNameParamRole.STATE]
              );
            }
          }
        }

        if (connector.lep2PsConnector) {
          const lep = connector.lep2PsConnector.parentNode;
          if (locNodeNames.indexOf(lep.name) < 0) {
            locNodeNames.push(lep.name);
          }
        }
      }
    }

    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const connector = pspart.sec2secConnectors[l];
      locNodeNames.push(connector.name);
      if (MyNodePropNameParamRole.POWER in connector) {
        if (connector[MyNodePropNameParamRole.POWER] !== "") {
          pushIfNotPushed(paramNames, connector[MyNodePropNameParamRole.POWER]);
        }
      }

      for (let m = 0; m < connector.equipments.length; m += 1) {
        const equipment = connector.equipments[m];
        // locNodeNames.push(equipment.name);
        if (MyNodePropNameParamRole.STATE in equipment) {
          if (equipment[MyNodePropNameParamRole.STATE] !== "") {
            pushIfNotPushed(
              paramNames,
              equipment[MyNodePropNameParamRole.STATE]
            );
          }
        }
      }
    }
  }

  const schema = new MyNodeSchema(
    `schema_of_${ps.name}`,
    ps.caption,
    ps.description,
    undefined,
    paramNames.sort().join(",")
  );
  schema.nodeNames = locNodeNames.sort().join(",");
  return schema;
}

const getDBSchema = (schemaName, callback) => {
  DbNodeSchema.findOne(
    {
      name: schemaName,
    },
    (err, schema) => {
      callback(err, schema);
    }
  );
};

const insertOrUpdateDBSchema = (schema, callback) => {
  getDBSchema(schema.name, (err, dbSchema) => {
    if (err) {
      callback(err);
    } else if (dbSchema) {
      if (
        dbSchema.caption !== schema.caption ||
        dbSchema.description !== schema.description ||
        dbSchema.nodeNames !== schema.nodeNames ||
        !(dbSchema.paramNames == schema.paramNames) // null !== undefined but null == undefined
      ) {
        DbNodeSchema.updateOne(
          { _id: dbSchema.id },
          {
            $set: {
              caption: schema.caption,
              description: schema.description,
              nodeNames: schema.nodeNames,
              paramNames: schema.paramNames,
            },
          },
          (error) => {
            if (error) {
              callback(err);
            } else {
              // updated++;
              logger.info(`Schema "${schema.name}" updated`);
              callback();
            }
          }
        );
      } else {
        callback();
      }
    } else {
      if (schema.nodeNames == "") {
        logger.warn(`Ignored inserting of Schema "${schema.name}". No nodes.`);
        callback();
      } else {
        const newDbSchema = new DbNodeSchema(schema);
        newDbSchema.save((err) => {
          if (err) {
            callback(`Exception on save Schema: ${err.message}`);
          } else {
            // inserted++;
            logger.info(`Schema "${schema.name}" inserted`);
            callback();
          }
        });
      }
    }
  });
};

function ReloadPSSchemaParams(psName, cb) {
  schemaName = `schema_of_${psName}`;

  if (nodeSchemas.has(schemaName)) {
    const ps = myDataModelNodes.GetPS(psName);
    if (ps) {
      const schema = CreatePSSchema(ps);
      insertOrUpdateDBSchema(schema, (err) => {
        if (err) return cb(err);

        DbNodeSchema.findOne({ name: schemaName }, (err, dbSchema) => {
          if (err) return cb(err);

          nodeSchemas.delete(schemaName);

          const obj = createMyNodeSchemaObj(dbSchema);
          nodeSchemas.set(obj.name, obj);
          return cb();
        });
      });
    } else {
      cb(Error(`Can't find PS with name = "${psName}".`));
    }
  } else {
    cb(Error(`Can't find PS Schema with name = "${schemaName}".`));
  }
}

function makeSchemaNamesForEachNode(cb) {
  if (process.env.RECALCULATION) {
    return cb();
  }

  const locNodes = myDataModelNodes.GetAllNodesAsArray();
  const locSchemas = Array.from(nodeSchemas.values());

  for (let i = 0; i < locNodes.length; i += 1) {
    const node = locNodes[i];
    const locSchemaNames = [];
    for (let j = 0; j < locSchemas.length; j += 1) {
      const schema = locSchemas[j];
      if (schema.nodes.indexOf(node) > -1) {
        if (locSchemaNames.indexOf(schema.name) < 0) {
          locSchemaNames.push(schema.name);
        }
      }
    }
    node.setSchemaNames(locSchemaNames);
  }
  return cb();
}

function makeSchemaNamesForEachParam(cb) {
  if (process.env.RECALCULATION) {
    return cb();
  }

  const locParams = myDataModelNodes.GetAllParamsAsArray();
  const locPSSchemas = Array.from(nodeSchemas.values());

  for (let i = 0; i < locParams.length; i += 1) {
    const param = locParams[i];
    const locPSSchemaNames = [];
    for (let j = 0; j < locPSSchemas.length; j += 1) {
      const schema = locPSSchemas[j];
      if (schema.paramNames.indexOf(param.name) > -1) {
        if (locPSSchemaNames.indexOf(schema.name) < 0) {
          locPSSchemaNames.push(schema.name);
        }
      }
    }
    param.setSchemaNames(locPSSchemaNames);
  }

  const communicationParams = locParams.filter(
    (param) =>
      param.name.endsWith("_IsOnline") ||
      param.name.endsWith("_CommunicationQuality")
  );
  for (let i = 0; i < communicationParams.length; i += 1) {
    const param = communicationParams[i];
    if (param.schemaNames.indexOf(ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME) < 0) {
      param.schemaNames.push(ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME);
    }
  }

  return cb();
}

const GetAvailableSchemas = (userName) => {
  const locSchemas = Array.from(nodeSchemas.values());
  const result = [];
  if (userName === "") {
    // temporary!
    for (let j = 0; j < locSchemas.length; j += 1) {
      const value = locSchemas[j];
      result.push({
        name: value.name,
        caption: value.caption,
        description: value.description,
      });
    }
  } else if (users.has(userName)) {
    const locMight = users.get(userName);
    let locMights = [];
    if (locMight) {
      locMights = locMight.split(",");
    }
    locMights.forEach((schemaName) => {
      if (nodeSchemas.has(schemaName)) {
        const locSchema = nodeSchemas.get(schemaName);
        if (locSchema !== undefined) {
          result.push(locSchema);
        }
      }
    });
  }
  return result;
};

const ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME =
  "schema_of_ASUTP_COMMUNICATION_MODEL";

const GetSchemaParamNamesAsArray = (schemaName) => {
  if (schemaName == ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME) {
    return myDataModelNodes.GetCommunacationParamNames();
  } else if (nodeSchemas.has(schemaName)) {
    const locSchema = nodeSchemas.get(schemaName);
    if (locSchema) {
      return locSchema.paramNames;
    }
  }
  return [];
};

const GetSchemaDefaultCoordinates = (schemaName) => {
  let coordinates = [];
  if (schemaName.startsWith("nodes_of_")) {
    getSchema1(schemaName, (err, schema) => {
      if (err) {
        // return;
      } else {
        for (let i = 0; i < schema.nodes.length; i += 1) {
          const node = schema.nodes[i];
          coordinates.push({
            schemaName,
            nodeName: node.name,
            x: node.x,
            y: node.y,
          });
        }
        // return coordinates;
      }
    });
  } else if (schemaName.startsWith("schema_of_")) {
    getPSSchema1(schemaName.replace("schema_of_", ""), (err, schema) => {
      if (err) {
        // return;
      } else {
        for (let i = 0; i < schema.nodes.length; i += 1) {
          const node = schema.nodes[i];
          coordinates.push({
            schemaName,
            nodeName: node.name,
            x: node.x,
            y: node.y,
          });
        }
        // return coordinates;
      }
    });
  } else {
    //
  }
  return coordinates;
};


module.exports.LoadFromDB = LoadFromDB;
module.exports.CreatePSSchema = CreatePSSchema;
module.exports.CreateNodeSchemasForRegions = CreateNodeSchemasForRegions;
module.exports.ReloadPSSchemaParams = ReloadPSSchemaParams;
module.exports.GetCustomAndRegionSchemas = GetCustomAndRegionSchemas;
module.exports.GetSchemaPSs = GetSchemaPSs;
module.exports.GetSchema = GetSchema;
module.exports.GetPSSchema = GetPSSchema;
module.exports.GetSchemaDefaultCoordinates = GetSchemaDefaultCoordinates;
module.exports.GetAvailableSchemas = GetAvailableSchemas;
module.exports.GetSchemaParamNamesAsArray = GetSchemaParamNamesAsArray;
module.exports.ReloadCustomSchema = ReloadCustomSchema;
module.exports.DeleteCustomSchema = DeleteCustomSchema;
module.exports.CustomSchemaAddNode = CustomSchemaAddNode;
module.exports.CustomSchemaDeleteNode = CustomSchemaDeleteNode;
