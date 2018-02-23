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
  createNetNodePSs,
  createNetNodeSections,
  createNetNodeCells,
  createNetNodeTransformers,
  createNetWires,
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
  console.log('models');
  // require('dbmodels/user');
  require('mongoose').model('AuthUser');  // eslint-disable-line global-require
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require
  require('mongoose').model('ParamValue');  // eslint-disable-line global-require
  require('mongoose').model('NetNode');  // eslint-disable-line global-require
  require('mongoose').model('NetNodePS');  // eslint-disable-line global-require
  require('mongoose').model('NetNodeSection');  // eslint-disable-line global-require
  require('mongoose').model('NetNodeCell');  // eslint-disable-line global-require
  require('mongoose').model('NetNodeTransformer');  // eslint-disable-line global-require
  require('mongoose').model('NetWire');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {
  console.log('create users');
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
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(users);
  fs.writeFileSync(`${config.importPath}users-2.json`, data);
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
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(params);
  fs.writeFileSync(`${config.importPath}params-2.json`, data);
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
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(paramLists);
  fs.writeFileSync(`${config.importPath}paramLists-2.json`, data);
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
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });


  const data = JSON.stringify(paramValues);
  fs.writeFileSync(`${config.importPath}paramValues-2.json`, data);
}

//----------------------------------------------------------------------------------------------------------------------


function createNetNodePSs(callback) {
  console.log('creating PSs');
  const fileName = `${config.importPath}PSs.json`;
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
    const locNode = new mongoose.models.NetNode(psData);
    const locPS = new mongoose.models.NetNodePS(psData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.id}" inserted`);
      locPS.save((err) => {
        if (err) callback(err);
        console.log(`NetNodePS "${locPS.id}" inserted`);
        callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(locPSs);
  fs.writeFileSync(`${config.importPath}PSs-2.json`, data);
}

function createNetNodeSections(callback) {
  console.log('creating Sections');
  const fileName = `${config.importPath}Sections.json`;
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
    const locNode = new mongoose.models.NetNode(locData);
    const locSection = new mongoose.models.NetNodeSection(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.id}" inserted`);
      locSection.save((err) => {
        if (err) callback(err);
        console.log(`NetNodeSection "${locSection.id}" inserted`);
        callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(locSections);
  fs.writeFileSync(`${config.importPath}Section-2.json`, data);
}

function createNetNodeCells(callback) {
  console.log('creating Cells');
  const fileName = `${config.importPath}Cells.json`;
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
    console.error(`create cells Error: ${e.message}`);
    return;
  }

  async.each(locCells, (locData, callback) => {
    const locNode = new mongoose.models.NetNode(locData);
    const locCell = new mongoose.models.NetNodeCell(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.id}" inserted`);
      locCell.save((err) => {
        if (err) callback(err);
        console.log(`NetNodeCell "${locCell.id}" inserted`);
        callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(locCells);
  fs.writeFileSync(`${config.importPath}cells-2.json`, data);
}

function createNetNodeTransformers(callback) {
  console.log('creating Transformers');
  const fileName = `${config.importPath}Transformers.json`;
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
    const locNode = new mongoose.models.NetNode(locData);
    const locTransformer = new mongoose.models.NetNodeTransformer(locData);
    locNode.save((err) => {
      if (err) callback(err);
      console.log(`NetNode "${locNode.id}" inserted`);
      locTransformer.save((err) => {
        if (err) callback(err);
        console.log(`NetNodeTransformer "${locTransformer.id}" inserted`);
        callback(null);
      });
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(locTransformers);
  fs.writeFileSync(`${config.importPath}Transformers-2.json`, data);
}

//----------------------------------------------------------------------------------------------------------------------
function createNetWires(callback) {
  console.log('create wires');
  const fileName = `${config.importPath}wires.json`;
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
      id: wire.nodeFrom,
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
      id: wire.nodeTo,
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
      console.log(`NetWire "${wire.id}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  const data = JSON.stringify(wires, null, ' ');
  fs.writeFileSync(`${config.importPath}wires-2.json`, data);
}

