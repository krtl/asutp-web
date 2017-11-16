const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');

const importPath = 'D:/mongodb_bases/';


async.series([
  open,
  requireModels,
  importParams,
], function (err) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load models
  require('../../server/models').connect(config.dbUri);

  mongoose.connection.on('open', callback);
}

function requireModels(callback) {
  console.log('models');
  require('mongoose').model('Param');
  require('mongoose').model('ParamList');

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}


function importParams(callback) {
  console.log('importing params..');
  const rawdata = fs.readFileSync(`${importPath}params.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const newParam = new mongoose.models.Param(paramData);

    //
    // var query = { name: newParam.name },
    //   update = { caption: newParam.caption, description: newParam.description },
    //   options = { upsert: true, new: true, setDefaultsOnInsert: true };
    //
    // mongoose.models.Param.findOneAndUpdate(query, update, options, function(error, result) {
    //   if (error) throw error;
    //
    //   // do something with the document
    // });

    mongoose.models.Param.findOne({
      name: newParam.name }, (err, param) => {
      if (err) callback(err);
      if (param) {
          // param exists

        if ((param.caption !== newParam.caption) || (param.description !== newParam.description)) {
          mongoose.models.Param.update({ _id: param.id }, { $set: { caption: newParam.caption, description: newParam.description } }, (error) => {
            if (error) throw callback(error);
            console.log(`Param "${newParam.name}" updated`);
            callback(null);
          });
        } else {
          return callback(null);
        }
      } else {
          // param does not exist
        newParam.save((err) => {
          if (err) callback(err);
          console.log(`Param "${newParam.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('All saved successfully');
    }
    callback(err);
  });
}
