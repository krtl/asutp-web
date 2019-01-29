/* eslint max-len: ["error", { "code": 300 }] */
const config = require('../../config');
const MyDataModelParams = require('../models/myDataModelParams');
const amqpSender = require('../amqp/amqp_send');
// const logger = require('../logger');
const moment = require('moment');

const Start = () => {
  amqpSender.start(config.amqpUri);
};

const TrackDbNodeStateValue = (newNodeStateValue) => {
  const node = MyDataModelParams.getParam(newNodeStateValue.nodeName);  // is that realy required??
  if (node !== undefined) {
    if (node.trackStateChanges) {
      const dt = moment(newNodeStateValue.dt).format('YYYY-MM-DD HH:mm:ss');
      const s = `${newNodeStateValue.nodeName}<>${newNodeStateValue.oldState}<>${newNodeStateValue.newState}<>${dt}`;
      amqpSender.send(config.amqpInsertNodeStateQueueName, s);
    }
  }
};

module.exports.TrackDbNodeStateValue = TrackDbNodeStateValue;
module.exports.Start = Start;

