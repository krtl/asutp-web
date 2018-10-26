const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
  createParams,
  createParamLists,
  createParamValues,
  createNetNodes,  // obsolete
  createNetWires,  // obsolete
  createNodeRESs,
  createNodeLEPs,
  createNodePSs,
  createNodePSParts,
  createNodeSections,
  createNodeTransformers,
  createNodeConnectors,
  createNodeEquipments,
], (err) => {
  // console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  console.log('drop');
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  console.log('requiring models');
  require('mongoose').model('AuthUser');  // eslint-disable-line global-require
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require
  require('mongoose').model('ParamValue');  // eslint-disable-line global-require

  require('mongoose').model('NetNode');  // eslint-disable-line global-require
  require('mongoose').model('NetWire');  // eslint-disable-line global-require

  require('mongoose').model('Node');  // eslint-disable-line global-require
  require('mongoose').model('NodeRES');  // eslint-disable-line global-require
  require('mongoose').model('NodePS');  // eslint-disable-line global-require
  require('mongoose').model('NodePSPart');  // eslint-disable-line global-require
  require('mongoose').model('NodeLEP');  // eslint-disable-line global-require
  require('mongoose').model('NodeTransformer');  // eslint-disable-line global-require
  require('mongoose').model('NodeSection');  // eslint-disable-line global-require
  require('mongoose').model('NodeConnector');  // eslint-disable-line global-require
  require('mongoose').model('NodeEquipment');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {
  console.log('creating users');
//  var users = require(importPath +'/users.json');

  const fileName = `${config.importPath}users.json`;
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const users = JSON.parse(rawdata);

  async.each(users, (userData, callback) => {
    const user = new mongoose.models.AuthUser(userData);
    user.save((err) => {
      if (err) callback(err);
      console.log(`User "${user.email}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(users);
  // fs.writeFileSync(`${config.importPath}users-2.json`, data);
}

function createParams(callback) {
  console.log('create params');
  const rawdata = fs.readFileSync(`${config.importPath}params.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const param = new mongoose.models.Param(paramData);
    param.save((err) => {
      if (err) callback(err);
      console.log(`Param "${param.name}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(params);
  // fs.writeFileSync(`${config.importPath}params-2.json`, data);
}

function createParamLists(callback) {
  console.log('create paramLists');
  const rawdata = fs.readFileSync(`${config.importPath}paramLists.json`);
  let paramLists;
  try {
    paramLists = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create paramLists Error: ${e.message}`);
    return;
  }

  async.each(paramLists, (paramListData, callback) => {
    const paramList = new mongoose.models.ParamList(paramListData);

    // Check param names
    for (let i = 0; i < paramList.params.length; i += 1) {
      const locName = paramList.params[i];
      mongoose.models.Param.findOne({
        name: locName }, (err, param) => {
        if (err) throw err;
        if (param) {
          // param exists
        } else {
          // param does not exist
          console.error(`create paramLists Error: Param "${locName}" does not exists for "${paramList.name}"!`);
        }
      });
    }

    paramList.save((err) => {
      if (err) callback(err);
      console.log(`ParamList "${paramList.name}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(paramLists);
  // fs.writeFileSync(`${config.importPath}paramLists-2.json`, data);
}

function createParamValues(callback) {
  console.log('creating paramValues');
  const fileName = `${config.importPath}paramValues.json`;
  console.log(`importing from "${fileName}"..`);
  const rawdata = fs.readFileSync(fileName);
  let paramValues;
  try {
    paramValues = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create paramValues Error: ${e.message}`);
    return;
  }

  async.each(paramValues, (paramValueData, callback) => {
    const paramValue = new mongoose.models.ParamValue(paramValueData);

    // Check param name
    const locName = paramValue.paramName;
    mongoose.models.Param.findOne({
      name: locName }, (err, param) => {
      if (err) throw err;
      if (param) {
        // param exists
        paramValue.save((err) => {
          if (err) callback(err);
          console.log(`ParamValue "${param.name}" inserted`);
          callback(null);
        });
      } else {
          // param does not exist
        console.error(`create paramValue Error: Param "${locName}" does not exists for "${paramValue.name}"!`);
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


  // const data = JSON.stringify(paramValues);
  // fs.writeFileSync(`${config.importPath}paramValues-2.json`, data);
}

//----------------------------------------------------------------------------------------------------------------------

function checkIfParentNodeExixts(node, callback) {
  if ((node.parentNode === undefined) || (node.parentNode === null) || node.parentNode === '') {
    callback(null);
  } else {
    mongoose.models.Node.findOne({
      name: node.parentNode,
    }, (err, netNode) => {
      if (err) callback(err);
      if (netNode) {
        // node exists
        callback(null);
      } else {
        // node does not exist
        const s = `Parent node "${node.parentNode}" does not exists for node:"${node.name}"!`;
        callback(s);
        console.error(s);
      }
    });
  }
}

function createNodeRESs(callback) {
  console.log('creating RESs');
  const fileName = `${config.importPath}nodeRESs.json`;
  console.log(`importing from "${fileName}"..`);
  const rawdata = fs.readFileSync(fileName);

  let locRESs;
  try {
    locRESs = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create RESs Error: ${e.message}`);
    return;
  }

  async.each(locRESs, (psData, callback) => {
    const locNode = new mongoose.models.Node(psData);
    const locRES = new mongoose.models.NodeRES(psData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`Node "${locNode.name}" inserted`);
      locRES.save((err) => {
        if (err) callback(err);
        console.log(`NodeRES "${locRES.name}" inserted`);
        callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locPSs);
  // fs.writeFileSync(`${config.importPath}PSs-2.json`, data);
}

function createNodeLEPs(callback) {
  console.log('creating Leps');
  const fileName = `${config.importPath}nodeLEPs.json`;
  console.log(`importing from "${fileName}"..`);
  const rawdata = fs.readFileSync(fileName);

  let locLeps;
  try {
    locLeps = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create Leps Error: ${e.message}`);
    return;
  }

  async.each(locLeps, (lepData, callback) => {
    const locNode = new mongoose.models.Node(lepData);
    const locLep = new mongoose.models.NodeLEP(lepData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.name}" inserted`);
      locLep.save((err) => {
        if (err) callback(err);
        console.log(`NetNodeLep "${locLep.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locLeps);
  // fs.writeFileSync(`${config.importPath}Leps-2.json`, data);
}

function createNodePSs(callback) {
  console.log('creating PSs');
  const fileName = `${config.importPath}nodePSs.json`;
  console.log(`importing from "${fileName}"..`);
  const rawdata = fs.readFileSync(fileName);

  let locPSs;
  try {
    locPSs = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create PSs Error: ${e.message}`);
    return;
  }

  async.each(locPSs, (psData, callback) => {
    const locNode = new mongoose.models.Node(psData);
    const locPS = new mongoose.models.NodePS(psData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.name}" inserted`);
      locPS.save((err) => {
        if (err) callback(err);
        console.log(`NetNodePS "${locPS.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locPSs);
  // fs.writeFileSync(`${config.importPath}PSs-2.json`, data);
}

function createNodePSParts(callback) {
  console.log('creating PSParts');
  const fileName = `${config.importPath}nodePSParts.json`;
  console.log(`importing from "${fileName}"..`);
  const rawdata = fs.readFileSync(fileName);

  let locPSs;
  try {
    locPSs = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create PSParts Error: ${e.message}`);
    return;
  }

  async.each(locPSs, (psData, callback) => {
    const locNode = new mongoose.models.Node(psData);
    const locPSPart = new mongoose.models.NodePS(psData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`Node "${locNode.name}" inserted`);
      locPSPart.save((err) => {
        if (err) callback(err);
        console.log(`NodePSPart "${locPSPart.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locPSs);
  // fs.writeFileSync(`${config.importPath}PSs-2.json`, data);
}

function createNodeTransformers(callback) {
  console.log('creating Transformers');
  const fileName = `${config.importPath}nodeTransformers.json`;
  console.log(`importing from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  let locTransformers;
  try {
    locTransformers = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create Transformers Error: ${e.message}`);
    return;
  }

  async.each(locTransformers, (locData, callback) => {
    const locNode = new mongoose.models.Node(locData);
    const locTransformer = new mongoose.models.NodeTransformer(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`Node "${locNode.name}" inserted`);
      locTransformer.save((err) => {
        if (err) callback(err);
        console.log(`NodeTransformer "${locTransformer.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locTransformers);
  // fs.writeFileSync(`${config.importPath}Transformers-2.json`, data);
}

function createNodeSections(callback) {
  console.log('creating Sections');
  const fileName = `${config.importPath}nodeSections.json`;
  console.log(`importing from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  let locSections;
  try {
    locSections = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create Sections Error: ${e.message}`);
    return;
  }

  async.each(locSections, (locData, callback) => {
    const locNode = new mongoose.models.Node(locData);
    const locSection = new mongoose.models.NodeSection(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`Node "${locNode.name}" inserted`);
      locSection.save((err) => {
        if (err) callback(err);
        console.log(`NodeSection "${locSection.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locSections);
  // fs.writeFileSync(`${config.importPath}Section-2.json`, data);
}

function createNodeConnectors(callback) {
  console.log('creating Connectors');
  const fileName = `${config.importPath}nodeConnectors.json`;
  console.log(`importing from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  let locCells;
  try {
    locCells = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create Connectors Error: ${e.message}`);
    return;
  }

  async.each(locCells, (locData, callback) => {
    const locNode = new mongoose.models.Node(locData);
    const locConnector = new mongoose.models.NodeConnector(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`Node "${locNode.name}" inserted`);
      locConnector.save((err) => {
        if (err) callback(err);
        console.log(`NodeConnector "${locConnector.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locCells);
  // fs.writeFileSync(`${config.importPath}cells-2.json`, data);
}

function createNodeEquipments(callback) {
  console.log('creating Equipments');
  const fileName = `${config.importPath}nodeEquipments.json`;
  console.log(`importing from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  let locCells;
  try {
    locCells = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create Equipments Error: ${e.message}`);
    return;
  }

  async.each(locCells, (locData, callback) => {
    const locNode = new mongoose.models.Node(locData);
    const locEquipment = new mongoose.models.NodeEquipment(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`Node "${locNode.name}" inserted`);
      locEquipment.save((err) => {
        if (err) callback(err);
        console.log(`NodeEquipment "${locEquipment.name}" inserted`);

        checkIfParentNodeExixts(locNode, callback);
        // callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locCells);
  // fs.writeFileSync(`${config.importPath}cells-2.json`, data);
}

//----------------------------------------------------------------------------------------------------------------------
function createNetNodes(callback) {
  console.log('creating NetNodes - obsolete');
  const fileName = `${config.importPath}obsolete-nodes.json`;
  console.log(`importing from "${fileName}"..`);
  let rawdata;
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (e) {
    console.error(`Read file Error: ${e.message}`);
    callback(e.message);
    return;
  }

  let locPSs;
  try {
    locPSs = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create NetNode Error: ${e.message}`);
    callback(e.message);
    return;
  }

  async.each(locPSs, (psData, callback) => {
    const locNode = new mongoose.models.NetNode(psData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.name}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(locPSs);
  // fs.writeFileSync(`${config.importPath}PSs-2.json`, data);
}

function createNetWires(callback) {
  console.log('create wires - obsolete');
  const fileName = `${config.importPath}obsolete-wires.json`;
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  let wires;
  try {
    wires = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create wires Error: ${e.message}`);
    return;
  }

  async.each(wires, (wireData, callback) => {
    const wire = new mongoose.models.NetWire(wireData);

    // Check nodes
    mongoose.models.NetNode.findOne({
      name: wire.nodeFrom,
    }, (err, netNode) => {
      if (err) throw err;
      if (netNode) {
          // node exists
      } else {
          // node does not exist
        console.error(`create wire Error: NetNode (nodeFrom) "${wire.nodeFrom}" does not exists!`);
      }
    });

    mongoose.models.NetNode.findOne({
      name: wire.nodeTo,
    }, (err, netNode) => {
      if (err) throw err;
      if (netNode) {
        // node exists
      } else {
        // node does not exist
        console.error(`create wire Error: NetNode (nodeTo) "${wire.nodeTo}" does not exists!`);
      }
    });

    wire.save((err) => {
      if (err) callback(err);
      console.log(`NetWire "${wire.name}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

//  const data = JSON.stringify(wires, null, ' ');
//  fs.writeFileSync(`${config.importPath}wires-2.json`, data);
}

