const mongoose = require('mongoose');
const logger = require('../logger');
// const myDataModel = require('../models/myDataModel');


module.exports.connect = (uri) => {
  // mongoose.connect(uri);
  mongoose.connect(uri, {
    useMongoClient: true,
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  // plug in the promise library:
  mongoose.Promise = global.Promise;

  mongoose.connection.on('connected', () => {
    logger.info(`Mongoose connection opened to ${uri}`);

    const myDataModel = require('../models/myDataModel');
    myDataModel.LoadFromDB();
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose default connection disconnected');
  });

  // load models
  require('./authUser');
  require('./param');
  require('./paramList');
  require('./netNode');
  require('./netWire');
};
