/* eslint max-len: ["error", { "code": 300 }] */
const config = require("../../config");
const MyDataModelNodes = require("../models/myDataModelNodes");
const amqpSender = require("../amqp/amqp_send");
// const logger = require('../logger');
const moment = require("moment");

const Start = () => {
  amqpSender.start(config.amqpUriParamValuesSender, "ParamValuesSender");
};

const TrackDbParamValue = newParamValue => {
  const param = MyDataModelNodes.GetParam(newParamValue.paramName); // is that realy required??
  if (param) {
    if (param.trackAllChanges || param.trackAveragePerHour) {
      const dt = moment(newParamValue.dt).format("YYYY-MM-DD HH:mm:ss.SSS");
      const s = `PV<>${newParamValue.paramName}<>${newParamValue.value}<>${newParamValue.qd}<>${dt}`;
      amqpSender.send(config.amqpInsertValuesQueueName, s);
    }
  }
};

const BlockParam = paramName => {
  amqpSender.send(config.amqpInsertValuesQueueName, `BP<>${paramName}`);
};

const UnblockParam = paramName => {
  amqpSender.send(config.amqpInsertValuesQueueName, `UBP<>${paramName}`);
};

const Stop = () => {
  amqpSender.stop();
};

module.exports.TrackDbParamValue = TrackDbParamValue;
module.exports.BlockParam = BlockParam;
module.exports.UnblockParam = UnblockParam;
module.exports.Start = Start;
module.exports.Stop = Stop;
