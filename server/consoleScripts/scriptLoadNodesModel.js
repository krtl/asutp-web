const mongoose = require('mongoose');
const myDataModelNodes = require('../models/myDataModelNodes');
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

myDataModelNodes.LoadFromDB((err) => {
  if (err) {
    console.error(`Failed! Error: ${err}`);
  } else {
    console.info('LoadFromDB Done!');

    // myDataModelNodes.RecalculateWholeShema();

    // myDataModelNodes.ExportPSs((err) => {
    //   if (err) {
    //     console.error(`Failed! ExportPSs Error: ${err}`);
    //   } else {
    //     console.info('ExportPSs Done!');
    //   }

    mongoose.connection.close((err) => {
      if (err) {
        console.info(`We are disconnected from db. Error: ${err}`);
      } else {
        console.info('We are disconnected from db.');
      }
    });
    // });
  }
});

