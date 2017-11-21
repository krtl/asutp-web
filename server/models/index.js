const mongoose = require('mongoose');
const logger = require('../logger');

module.exports.connect = (uri) => {
  // mongoose.connect(uri);
  mongoose.connect(uri, {
    useMongoClient: true,
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  // plug in the promise library:
  mongoose.Promise = global.Promise;


  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  // load models
  require('./authUser');
  require('./param');
  require('./paramList');
  require('./netNode');
  require('./netWire');
};
