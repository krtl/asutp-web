const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');

const NetWire = require('../dbmodels/netWire');
const NetNode = require('../dbmodels/netNode');
const NetNodeLep = require('../dbmodels/netNodeLep');
const NetNodePS = require('../dbmodels/netNodePS');
const NetNodeCell = require('../dbmodels/netNodeCell');
const NetNodeSection = require('../dbmodels/netNodeSection');
const NetNodeTransformer = require('../dbmodels/netNodeTransformer');


async.series([
  open,
  requireModels,
  importNodePSs,
  importNodeLeps,
  importNodeSections,
  importNodeCells,
  importNodeTransformers,
  importWires,
], (err) => {
//  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}

function requireModels(callback) {
  console.log('models');
  // require('mongoose').model('NetNode');  // eslint-disable-line global-require
  // require('mongoose').model('NetWire');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function getNodeEx(nodeModel, nodeName, callback) {
  nodeModel.findOne({
    name: nodeName,
  }, (err, netNode) => {
    callback(err, netNode);
  });
}

function getNode(nodeName, callback) {
  getNodeEx(NetNode, nodeName, callback);
}

function getNodePS(nodeName, callback) {
  getNodeEx(NetNodePS, nodeName, callback);
}

function getNodeLep(nodeName, callback) {
  getNodeEx(NetNodeLep, nodeName, callback);
}

function getNodeCell(nodeName, callback) {
  getNodeEx(NetNodeCell, nodeName, callback);
}

function getNodeSection(nodeName, callback) {
  getNodeEx(NetNodeSection, nodeName, callback);
}
function getNodeTransformer(nodeName, callback) {
  getNodeEx(NetNodeTransformer, nodeName, callback);
}

function isTheSameNode(netNode1, netNode2) {
  return ((netNode1.caption === netNode2.caption) &&
    (netNode1.description === netNode2.description) &&
    (netNode1.x === netNode2.x) &&
    (netNode1.y === netNode2.y));
}

function isTheSameNodePS(netNode1, netNode2) {
  return (netNode1.dummyParam === netNode2.dummyParam);
}

function isTheSameNodeLep(netNode1, netNode2) {
  return (netNode1.dummyParam === netNode2.dummyParam);
}

function isTheSameNodeCell(netNode1, netNode2) {
  return (netNode1.paramOnOffState === netNode2.paramOnOffState);
}

function isTheSameNodeSection(netNode1, netNode2) {
  return (netNode1.dummyParam === netNode2.dummyParam);
}

function isTheSameNodeTransformer(netNode1, netNode2) {
  return (netNode1.testPower === netNode2.testPower);
}

function updateNode(originNode, newNode, callback) {
  NetNode.update({ _id: originNode.id },
    { $set: {
      caption: newNode.caption,
      description: newNode.description,
      x: newNode.x,
      y: newNode.y } }, callback);
}

function updateNodeLep(originNode, newNode, callback) {
  NetNodeLep.update({ _id: originNode.id },
    { $set: {
      dummyParam: newNode.dummyParam,
    } }, callback);
}

function updateNodePS(originNode, newNode, callback) {
  NetNodePS.update({ _id: originNode.id },
    { $set: {
      dummyParam: newNode.dummyParam,
    } }, callback);
}

function updateNodeSection(originNode, newNode, callback) {
  NetNodeSection.update({ _id: originNode.id },
    { $set: {
      dummyParam: newNode.dummyParam,
    } }, callback);
}

function updateNodeCell(originNode, newNode, callback) {
  NetNodeCell.update({ _id: originNode.id },
    { $set: {
      dummyParam: newNode.dummyParam,
    } }, callback);
}

function updateNodeTransformer(originNode, newNode, callback) {
  NetNodeTransformer.update({ _id: originNode.id },
    { $set: {
      testPower: newNode.testPower,
    } }, callback);
}

function getWire(wireName, callback) {
  NetWire.findOne({
    name: wireName,
  }, (err, netWire) => {
    callback(err, netWire);
  });
}

function isTheSameWires(netWire1, netWire2) {
  return ((netWire1.nodeFrom === netWire2.nodeFrom) &&
    (netWire1.nodeTo === netWire2.nodeTo));
}

function updateWire(originWire, newWire, callback) {
  NetWire.update({ _id: originWire.id },
    { $set: {
      nodeFrom: newWire.nodeFrom,
      nodeTo: newWire.nodeTo } }, callback);
}

function importWires(callback) {
  const fileName = `${config.importPath}wires.json`;
  console.log(`importing wires from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const wires = JSON.parse(rawdata);

  async.each(wires, (nodeData, callback) => {
    const newWire = new NetWire(nodeData);

    getNode(newWire.nodeFrom, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        getNode(newWire.nodeTo, (err, netNode) => {
          if (err) callback(err);
          if (netNode) {
            // node exists

            getWire(newWire.name, (err, wire) => {
              if (err) callback(err);
              if (wire) {
                // wire exists

                if (!isTheSameWires(wire, newWire)) {
                  updateWire(wire, newWire, (error) => {
                    if (error) callback(error);
                    console.log(`NetWire "${newWire.name}" updated`);
                    callback(null);
                  });
                } else {
                  callback(null);
                }
              } else {
                // does not exist
                newWire.save((err) => {
                  if (err) {
                    callback(err);
                  }
                  console.log(`NetWire "${newWire.name}" inserted`);
                  callback(null);
                });
              }
            });
          } else {
            // node does not exist
            callback(new Error(`create wire Error: NetNode (nodeTo) "${newWire.nodeTo}" does not exists!`));
          }
        });
      } else {
        // node does not exist
        callback(new Error(`create wire Error: NetNode (nodeFrom) "${newWire.nodeFrom}" does not exists!`));
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}

function importNodePSs(callback) {
  const fileName = `${config.importPath}PSs.json`;
  console.log(`importing PSs from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const locPSs = JSON.parse(rawdata);

  async.each(locPSs, (locData, callback) => {
    const newNode = new NetNode(locData);
    const newNodePS = new NetNodePS(locData);

    getNode(newNode.name, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        if (!isTheSameNode(netNode, newNode)) {
          updateNode(netNode, newNode, (error) => {
            if (error) callback(error);
            console.log(`NetNode "${newNode.name}" updated`);
          });
        }
      } else {
        // does not exist
        newNode.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNode "${newNode.name}" inserted`);
        });
      }
    });

    getNodePS(newNode.name, (err, netNodePS) => {
      if (err) callback(err);
      if (netNodePS) {
            // node exists

        if (!isTheSameNodePS(netNodePS, newNodePS)) {
          updateNodePS(netNodePS, newNodePS, (error) => {
            if (error) callback(error);
            console.log(`NetNodePS "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
                // does not exist
        newNodePS.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNodePS "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}

function importNodeLeps(callback) {
  const fileName = `${config.importPath}Leps.json`;
  console.log(`importing Leps from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const locLeps = JSON.parse(rawdata);

  async.each(locLeps, (locData, callback) => {
    const newNode = new NetNode(locData);
    const newNodeLep = new NetNodeLep(locData);

    getNode(newNode.name, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        if (!isTheSameNode(netNode, newNode)) {
          updateNode(netNode, newNode, (error) => {
            if (error) callback(error);
            console.log(`NetNode "${newNode.name}" updated`);
          });
        }
      } else {
        // does not exist
        newNode.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNode "${newNode.name}" inserted`);
        });
      }
    });

    getNodeLep(newNode.name, (err, netNodeLep) => {
      if (err) callback(err);
      if (netNodeLep) {
        // node exists

        if (!isTheSameNodeLep(netNodeLep, newNodeLep)) {
          updateNodeLep(netNodeLep, newNodeLep, (error) => {
            if (error) callback(error);
            console.log(`NetNodeLep "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
        // does not exist
        newNodeLep.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNodeLep "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}

function importNodeSections(callback) {
  const fileName = `${config.importPath}Sections.json`;
  console.log(`importing Sections from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const locSections = JSON.parse(rawdata);

  async.each(locSections, (locData, callback) => {
    const newNode = new NetNode(locData);
    const newNodeSection = new NetNodeSection(locData);

    getNode(newNode.name, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        if (!isTheSameNode(netNode, newNode)) {
          updateNode(netNode, newNode, (error) => {
            if (error) callback(error);
            console.log(`NetNode "${newNode.name}" updated`);
          });
        }
      } else {
        // does not exist
        newNode.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNode "${newNode.name}" inserted`);
        });
      }
    });

    getNodeSection(newNode.name, (err, netNodeSection) => {
      if (err) callback(err);
      if (netNodeSection) {
        // node exists

        if (!isTheSameNodeSection(netNodeSection, newNodeSection)) {
          updateNodeSection(netNodeSection, newNodeSection, (error) => {
            if (error) callback(error);
            console.log(`NetNodeSection "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
        // does not exist
        newNodeSection.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNodeSection "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}

function importNodeCells(callback) {
  const fileName = `${config.importPath}Cells.json`;
  console.log(`importing Cells from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const locCells = JSON.parse(rawdata);

  async.each(locCells, (locData, callback) => {
    const newNode = new NetNode(locData);
    const newNodeCell = new NetNodeCell(locData);

    getNode(newNode.name, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        if (!isTheSameNode(netNode, newNode)) {
          updateNode(netNode, newNode, (error) => {
            if (error) callback(error);
            console.log(`NetNode "${newNode.name}" updated`);
          });
        }
      } else {
        // does not exist
        newNode.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNode "${newNode.name}" inserted`);
        });
      }
    });

    getNodeCell(newNode.name, (err, netNodeCell) => {
      if (err) callback(err);
      if (netNodeCell) {
        // node exists

        if (!isTheSameNodeCell(netNodeCell, newNodeCell)) {
          updateNodeCell(netNodeCell, newNodeCell, (error) => {
            if (error) callback(error);
            console.log(`NetNodeCell "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
        // does not exist
        newNodeCell.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNodeCell "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}

function importNodeTransformers(callback) {
  const fileName = `${config.importPath}Transformers.json`;
  console.log(`importing Transformers from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const locTransformers = JSON.parse(rawdata);

  async.each(locTransformers, (locData, callback) => {
    const newNode = new NetNode(locData);
    const newNodeTransformer = new NetNodeTransformer(locData);

    getNode(newNode.name, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists

        if (!isTheSameNode(netNode, newNode)) {
          updateNode(netNode, newNode, (error) => {
            if (error) callback(error);
            console.log(`NetNode "${newNode.name}" updated`);
          });
        }
      } else {
        // does not exist
        newNode.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNode "${newNode.name}" inserted`);
        });
      }
    });

    getNodeTransformer(newNode.name, (err, netNodeTransformer) => {
      if (err) callback(err);
      if (netNodeTransformer) {
        // node exists

        if (!isTheSameNodeTransformer(netNodeTransformer, newNodeTransformer)) {
          updateNodeTransformer(netNodeTransformer, newNodeTransformer, (error) => {
            if (error) callback(error);
            console.log(`NetNodeTransformer "${newNode.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
        // does not exist
        newNodeTransformer.save((err) => {
          if (err) {
            callback(err);
          }
          console.log(`NetNodeTransformer "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}
