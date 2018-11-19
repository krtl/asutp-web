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

myDataModelParams.LoadFromDB((err) => {
  if (err) {
    console.error(`Failed! Error: ${err}`);
  } else {
    // console.info('Done!');
  }
});


const lastValues = require('../values/lastValues');

lastValues.init(
    { useDbValueTracker: false });


require('../values/amqp_receive');
require('../values/amqp_send');


// mongoose.connection.close((err) => {
//     if (err) {
//       console.info(`We are disconnected from db. Error: ${err}`);
//     } else {
//       console.info('We are disconnected from db.');
//     }
//   });
// });
