const mongoose = require('mongoose');
const config = require('../../config');
// const amqpReceiver = require('../amqp/amqp_receive');
// require('../values/amqpRawValuesReceiver');

process.env.LOGGER_NAME = 'amqpSender';
process.env.LOGGER_LEVEL = 'debug';

require('../logger');

const amqpSender = require('../amqp/amqp_send');
// const MyParamValue = require('../models/myParamValue');
// const lastValues = require('../values/lastValues');
const moment = require('moment');
// const myDataModelParams = require('../models/myDataModelParams');


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

// myDataModelParams.LoadFromDB((err) => {
//   if (err) {
//     console.error(`Failed! Error: ${err}`);
//   } else {
//     // console.info('Done!');
//   }
// });


// lastValues.init(
//     { useDbValueTracker: true });

// amqpReceiver.start(config.amqpUri, config.amqpInsertValuesQueueName, (received) => {
//   console.debug('[] Got msg', received);

//       // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
//   const s = received.split('<>');
//   if (s.length === 4) {
  // const momentDT = moment(s[3]);
  // const dt = new Date(momentDT);
//     const float = parseFloat(s[1]);
//     const obj = new MyParamValue(s[0], float, dt, s[2]);

//     lastValues.setLastValue(obj);
//   } else {
//     console.error('[][MyParamValue] Failed to parse: ', received);
//   }
// });

amqpSender.start(config.amqpUri);

setInterval(() => {
  const dt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  const s = `param${Math.round(Math.random() * 20)}<>${Math.round(Math.random() * 100000) / 100}<>NA<>${dt}`;
  console.debug('[] Sending msg', s);
  // amqpSender.send(config.amqpInsertValuesQueueName, s);
  amqpSender.send(config.amqpRawValuesQueueName, s);
}, 1000);

setInterval(() => {
  const dt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  const s = `param${Math.round(Math.random() * 5)}_VV<>${Math.round(Math.random() * 1)}<>NV<>${dt}`;
  console.debug('[] Sending msg', s);
  // amqpSender.send(config.amqpInsertValuesQueueName, s);
  amqpSender.send(config.amqpRawValuesQueueName, s);
}, 2000);

// mongoose.connection.close((err) => {
//     if (err) {
//       console.info(`We are disconnected from db. Error: ${err}`);
//     } else {
//       console.info('We are disconnected from db.');
//     }
//   });
// });
