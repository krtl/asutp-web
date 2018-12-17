const mongoose = require('mongoose');
const myDataModelNodes = require('../models/myDataModelNodes');
const config = require('../../config');

// const fs = require('fs');

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
    console.info('Done!');

    // const names = [ 'tp10-7103' ];

    // names.forEach((name) => {
    //   const locNode = myDataModelNodes.GetNode(name);
    //   if (locNode !== undefined) {
    //     const json = JSON.stringify(locNode);

    //     fs.writeFile(`${name}.json`, json, 'utf8', (err) => {
    //       if (err) {
    //         console.error(`Failed! Error: ${err}`);
    //       } else {
    //         console.info('FileWriteDone!');
    //       }
    //     });
    //   }
    // });
  }

  mongoose.connection.close((err) => {
    if (err) {
      console.info(`We are disconnected from db. Error: ${err}`);
    } else {
      console.info('We are disconnected from db.');
    }
  });
});

