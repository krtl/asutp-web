const async = require('async');

let DbNode;
let DbNodeRES;
let DbNodeLEP;
let DbNodePS;
let DbNodePSPart;
let DbNodeTransformer;
let DbNodeSection;
let DbNodeConnector;
let DbNodeEquipment;


const logger = require('../logger');

// const MyNode = require('./myNode');
const MyNodeRES = require('./myNodeRES');
const MyNodeLEP = require('./myNodeLEP');
const MyNodePS = require('./myNodePS');
const MyNodePSPart = require('./myNodePSPart');
const MyNodeTransformer = require('./myNodeTransformer');
const MyNodeSection = require('./myNodeSection');
const MyNodeConnector = require('./myNodeConnector');
const MyNodeEquipment = require('./myNodeEquipment');

const nodes = new Map();

const LoadFromDB = (cb) => {
  async.series([
    clearData,
    loadNodeRESs,
    loadNodeLEPs,
    loadNodePSs,
    loadNodePSParts,
    loadNodeSections,
    loadNodeTransformers,
    loadNodeConnectors,
    loadNodeEquipments,
    linkData,
    checkData,
  ], (err) => {
    if (err) {
      logger.error(`[sever] failed to load params: ${err}`);
      return cb(err);
    }
    logger.info(`[sever] loaded from DB with ${nodes.size} Nodes.`);
    return cb('');
  });
};

function clearData(cb) {
  nodes.clear();

  DbNode = require('mongoose').model('Node');  // eslint-disable-line global-require
  DbNodeRES = require('mongoose').model('NodeRES');  // eslint-disable-line global-require
  DbNodeLEP = require('mongoose').model('NodeLEP');  // eslint-disable-line global-require
  DbNodePS = require('mongoose').model('NodePS');  // eslint-disable-line global-require
  DbNodePSPart = require('mongoose').model('NodePSPart');  // eslint-disable-line global-require
  DbNodeTransformer = require('mongoose').model('NodeTransformer');  // eslint-disable-line global-require
  DbNodeSection = require('mongoose').model('NodeSection');  // eslint-disable-line global-require
  DbNodeConnector = require('mongoose').model('NodeConnector');  // eslint-disable-line global-require
  DbNodeEquipment = require('mongoose').model('NodeEquipment');  // eslint-disable-line global-require

  return cb();
}

function loadNodeRESs(cb) {
  DbNodeRES.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeRES) => {
      DbNode.NetNode.findOne({
        name: nodeRES.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeRES(locParentNode,
            nodeRES.name,
            nodeRES.caption,
            nodeRES.description);
            // p.dummyParam = nodeRES.dummyParam;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodeRES Error: DBNode "${nodeRES.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodeLEPs(cb) {
  DbNodeLEP.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeLEP) => {
      DbNode.NetNode.findOne({
        name: nodeLEP.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeLEP(locParentNode,
            nodeLEP.name,
            nodeLEP.caption,
            nodeLEP.description);
          p.voltage = nodeLEP.voltage;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodeLEP Error: DBNode "${nodeLEP.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodePSs(cb) {
  DbNodePS.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodePS) => {
      DbNode.NetNode.findOne({
        name: nodePS.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodePS(locParentNode,
            nodePS.name,
            nodePS.caption,
            nodePS.description);
          // p.voltage = nodePS.voltage;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodePS Error: DBNode "${nodePS.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodePSParts(cb) {
  DbNodePSPart.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodePSPart) => {
      DbNode.NetNode.findOne({
        name: nodePSPart.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodePSPart(locParentNode,
            nodePSPart.name,
            nodePSPart.caption,
            nodePSPart.description);
          // p.voltage = nodePSPart.voltage;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodePSPart Error: DBNode "${nodePSPart.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodeTransformers(cb) {
  DbNodeTransformer.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeTransformer) => {
      DbNode.NetNode.findOne({
        name: nodeTransformer.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeTransformer(locParentNode,
            nodeTransformer.name,
            nodeTransformer.caption,
            nodeTransformer.description);
          p.power = nodeTransformer.power;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodeTransformer Error: DBNode "${nodeTransformer.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodeSections(cb) {
  DbNodeSection.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeSection) => {
      DbNode.NetNode.findOne({
        name: nodeSection.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeSection(locParentNode,
            nodeSection.name,
            nodeSection.caption,
            nodeSection.description);
          // p.voltage = nodeSection.voltage;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodeSection Error: DBNode "${nodeSection.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodeConnectors(cb) {
  DbNodeConnector.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeConnector) => {
      DbNode.NetNode.findOne({
        name: nodeConnector.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeConnector(locParentNode,
            nodeConnector.name,
            nodeConnector.caption,
            nodeConnector.description);
          // p.voltage = nodePS.voltage;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodeConnector Error: DBNode "${nodeConnector.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function loadNodeEquipments(cb) {
  DbNodeEquipment.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeEquipment) => {
      DbNode.NetNode.findOne({
        name: nodeEquipment.name,
      }, (err, locNode) => {
        if (err) {
          return cb(err);
        } else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode);
          }
          const p = new MyNodeEquipment(locParentNode,
            nodeEquipment.name,
            nodeEquipment.caption,
            nodeEquipment.description);
          // p.voltage = nodePS.voltage;
          nodes.set(p.name, p);
          return cb(null);
        }
          // node does not exist
        const s = `create NodeEquipment Error: DBNode  "${nodeEquipment.name}" does not exists!`;
        logger.error(s);
        return cb(s);
      });
    });
    return false;
  });
}

function checkData(cb) {
  // ..
  return cb();
}

function linkData(cb) {
  // nodes.forEach((node) => {

  // });

  return cb();
}

const GetNode = nodeName => nodes.get(nodeName);


module.exports.LoadFromDB = LoadFromDB;
module.exports.GetNode = GetNode;

