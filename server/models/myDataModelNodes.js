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

let MyNode = require('./myNode');
let MyNodeRES = require('./myNodeRES');
let MyNodeLEP = require('./myNodeLEP');
let MyNodePS = require('./myNodePS');
let MyNodePSPart = require('./myNodePSPart');
let MyNodeTransformer = require('./myNodeTransformer');
let MyNodeSection = require('./myNodeSection');
let MyNodeConnector = require('./myNodeConnector');
let MyNodeEquipment = require('./myNodeEquipment');

const nodes = new Map();

const LoadFromDB = (cb) => {
  async.series([
    clearData,
    loadNodes,
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

function loadNodes(cb) {
  DbNode.find({}, null, { sort: { name: 1 } }, (err, locNodes) => {
    if (err) return cb(err);
    locNodes.forEach((usr) => {
      !!
      nodes.set(usr.name, usr.might);
    });
    return cb();
  });
}

function loadNodeRESs(cb) {
  DbNodeRES.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeRES) => {
      DbNode.NetNode.findOne({
        name: nodeRES.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodeRES(locParentNode, 
            nodeRES.name,
            nodeRES.caption,
            nodeRES.description);
            // p.dummyParam = nodeRES.dummyParam;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodeRES Error: DBNode "${nodeRES.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodeLEPs(cb) {
  DbNodeLEP.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeLEP) => {
      DbNode.NetNode.findOne({
        name: nodeLEP.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodeLEP(locParentNode, 
            nodeLEP.name,
            nodeLEP.caption,
            nodeLEP.description);
          p.voltage = nodeLEP.voltage;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodeLEP Error: DBNode "${nodeLEP.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodePSs(cb) {
  DbNodePS.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodePS) => {
      DbNode.NetNode.findOne({
        name: nodePS.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodePS(locParentNode, 
            nodePS.name,
            nodePS.caption,
            nodePS.description);
          //p.voltage = nodePS.voltage;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodePS Error: DBNode "${nodePS.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodePSParts(cb) {
  DbNodePSPart.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodePSPart) => {
      DbNode.NetNode.findOne({
        name: nodePSPart.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodePS(locParentNode, 
            nodePSPart.name,
            nodePSPart.caption,
            nodePSPart.description);
          //p.voltage = nodePSPart.voltage;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodePSPart Error: DBNode "${nodePSPart.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodeTransformers(cb) {
  DbNodeTransformer.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeTransformer) => {
      DbNode.NetNode.findOne({
        name: nodeTransformer.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodePS(locParentNode, 
            nodeTransformer.name,
            nodeTransformer.caption,
            nodeTransformer.description);
          p.power = nodePS.power;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodeTransformer Error: DBNode "${nodeTransformer.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodeSections(cb) {
  DbNodeSection.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeSection) => {
      DbNode.NetNode.findOne({
        name: nodeSection.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodePS(locParentNode, 
            nodeSection.name,
            nodeSection.caption,
            nodeSection.description);
          //p.voltage = nodeSection.voltage;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodeSection Error: DBNode "${nodeSection.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodeConnectors(cb) {
  DbNodeConnector.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeConnector) => {
      DbNode.NetNode.findOne({
        name: nodeConnector.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodePS(locParentNode, 
            nodeConnector.name,
            nodeConnector.caption,
            nodeConnector.description);
          //p.voltage = nodePS.voltage;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodeConnector Error: DBNode "${nodeConnector.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function loadNodeEquipments(cb) {
  DbNodePS.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((nodeEquipment) => {
      DbNode.NetNode.findOne({
        name: nodeEquipment.name,
      }, (err, locNode) => {
        if (err){
          return cb(err)
        }
        else if (locNode) {
          let locParentNode = null;
          if (nodes.has(locNode.parentNode)) {
            locParentNode = nodes.get(locNode.parentNode)
          }
          const p = new MyNodePS(locParentNode, 
            nodeEquipment.name,
            nodeEquipment.caption,
            nodeEquipment.description);
          //p.voltage = nodePS.voltage;
          nodes.set(p.name, p);
          return cb(null);
        } else {
          // node does not exist
          const err = `create NodeEquipment Error: DBNode  "${nodeEquipment.name}" does not exists!`;
          console.error(err);
          return cb(err);
        }
      });
    });
  });
}

function checkData(cb) {
  // ..
  return cb();
}

function linkData(cb) {
  nodes.forEach((node) => {
    const locListNames = [];
    paramLists.forEach((prmList) => {
      if (prmList.paramNames.indexOf(node.name) > -1) {
        locListNames.push(prmList.name);
      }
    });
    node.setListNames(locListNames);
  });

  return cb();
}

const GetNode = nodeName => nodes.get(nodeName);


module.exports.LoadFromDB = LoadFromDB;
module.exports.GetNode = GetNode;

