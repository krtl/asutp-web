/* eslint max-len: ["error", { "code": 300 }] */
const config = require("../../config");
const MyDataModelNodes = require("../models/myDataModelNodes");
const amqpInsertValuesSender = require("../amqp/amqp_send2");
// const logger = require('../logger');
const moment = require("moment");

const Start = () => {
  amqpInsertValuesSender.start(config.amqpUriParamValuesSender, "ParamValuesSender");
};

const TrackDbParamValue = newParamValue => {
  const param = MyDataModelNodes.GetParam(newParamValue.paramName); // is that realy required??
  if (param) {
    if (param.trackAllChanges || param.trackAveragePerHour) {
      const dt = moment(newParamValue.dt).format("YYYY-MM-DD HH:mm:ss.SSS");
      const s = `PV<>${newParamValue.paramName}<>${newParamValue.value}<>${newParamValue.qd}<>${dt}`;
      amqpInsertValuesSender.send(config.amqpInsertValuesQueueName, s);
    }
  }
};

const BlockParam = (paramName, user) => {
  amqpInsertValuesSender.send(config.amqpInsertValuesQueueName, `BP<>${paramName}<>${user}`);
};

const UnblockParam = paramName => {
  amqpInsertValuesSender.send(config.amqpInsertValuesQueueName, `UBP<>${paramName}`);
};

const Stop = () => {
  amqpInsertValuesSender.stop();
};

module.exports.TrackDbParamValue = TrackDbParamValue;
module.exports.BlockParam = BlockParam;
module.exports.UnblockParam = UnblockParam;
module.exports.Start = Start;
module.exports.Stop = Stop;
