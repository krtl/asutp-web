/* eslint max-len: ["error", { "code": 300 }] */
const config = require('../../config');
const MyDataModelNodes = require('../models/myDataModelNodes');
const amqpSender = require('../amqp/amqp_send');
// const logger = require('../logger');
const moment = require('moment');

const Start = () => {
  amqpSender.start(config.amqpUri);
};

const TrackDbNodeStateValue = (newNodeStateValue) => {
  const node = MyDataModelNodes.GetNode(newNodeStateValue.nodeName);  // is that realy required??
  if (node !== undefined) {
    // if (node.trackStateChanges) {
    const dt = moment(newNodeStateValue.dt).format('YYYY-MM-DD HH:mm:ss.SSS');
    const s = `${newNodeStateValue.nodeName}<>${newNodeStateValue.oldState}<>${newNodeStateValue.newState}<>${dt}`;
    amqpSender.send(config.amqpInsertNodeStateQueueName, s);
    // }
  }
};

const Stop = () => {
  amqpSender.stop();
};

module.exports.TrackDbNodeStateValue = TrackDbNodeStateValue;
module.exports.Start = Start;
module.exports.Stop = Stop;
