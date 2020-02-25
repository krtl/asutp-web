/* eslint max-len: ["error", { "code": 300 }] */
const config = require("../../config");
const MyDataModelNodes = require("../models/myDataModelNodes");
const amqpInsertNodeStateSender = require("../amqp/amqp_send1");
// const logger = require('../logger');
const moment = require("moment");

const Start = () => {
  amqpInsertNodeStateSender.start(config.amqpUriNodeStateSender, "NodeStateSender");
};

const TrackDbNodePoweredStateValue = newNodeStateValue => {
  // console.log('Powered state tracking:', newNodeStateValue);

  const node = MyDataModelNodes.GetNode(newNodeStateValue.nodeName); // is that realy required??
  if (node !== undefined) {
    const dt = moment(newNodeStateValue.dt).format("YYYY-MM-DD HH:mm:ss.SSS");
    const s = `P<>${newNodeStateValue.nodeName}<>${newNodeStateValue.oldState}<>${newNodeStateValue.newState}<>${dt}`;
    amqpInsertNodeStateSender.send(config.amqpInsertNodeStateQueueName, s);
  }
};

const TrackDbNodeSwitchedOnStateValue = newNodeStateValue => {
  // console.log('Switched state tracking:', newNodeStateValue);

  const node = MyDataModelNodes.GetNode(newNodeStateValue.connectorName); // is that realy required??
  if (node !== undefined) {
    const dt = moment(newNodeStateValue.dt).format("YYYY-MM-DD HH:mm:ss.SSS");
    const s = `S<>${newNodeStateValue.connectorName}<>${newNodeStateValue.oldState}<>${newNodeStateValue.newState}<>${dt}`;
    amqpInsertNodeStateSender.send(config.amqpInsertNodeStateQueueName, s);
  }
};

const Stop = () => {
  amqpInsertNodeStateSender.stop();
};

module.exports.TrackDbNodePoweredStateValue = TrackDbNodePoweredStateValue;
module.exports.TrackDbNodeSwitchedOnStateValue = TrackDbNodeSwitchedOnStateValue;
module.exports.Start = Start;
module.exports.Stop = Stop;
