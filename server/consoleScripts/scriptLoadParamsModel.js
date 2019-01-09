const mongoose = require('mongoose');
const myDataModelParams = require('../models/myDataModelParams');
const config = require('../../config');


mongoose.Promise = global.Promise;

mongoose.connect(config.dbUri, {
  useMongoClient: true,
  autoIndex: process.env.NODE_ENV !== 'production',
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.on('connected', () => {
  console.info(`We are connected to ${config.dbUri}`);
});

myDataModelParams.loadFromDB((err) => {
  if (err) {
    console.error(`Failed! Error: ${err}`);
  } else {
    console.info('Done!');
  }

  // const lists = myDataModelParams.getAvailableParamsLists("");

  mongoose.connection.close((err) => {
    if (err) {
      console.info(`We are disconnected from db. Error: ${err}`);
    } else {
      console.info('We are disconnected from db.');
    }
  });
});
