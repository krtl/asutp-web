const moment = require("moment");
const MyParamValue = require("../models/myParamValue");
const config = require("../../config");
const amqpRawValuesReceiver = require("../amqp/amqp_receive");
const lastValues = require("./lastValues");
const logger = require("../logger");

const Start = () => {
  amqpRawValuesReceiver.start(
    config.amqpUriAsutpValuesReceiver,
    config.amqpRawValuesQueueName,
    received => {
      logger.verbose(`[RawValuesReceiver] Got msg ${received}`);

      // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
      const s = received.split("<>");
      if (s.length === 4) {
        const momentDT = moment(s[3]);
        const dt = new Date(momentDT);
        const float = parseFloat(s[1].replace(",", "."));
        const obj = new MyParamValue(s[0], float, dt, s[2]);
        if (isNaN(float)) {
          logger.error(
            `[RawValuesReceiver][MyParamValue] Failed to parse floating-point value from: ${received}`
          );
        } else {
          lastValues.setRawValue(obj);
        }
      } else {
        logger.error(
          `[RawValuesReceiver][MyParamValue] Failed to parse:  ${received}`
        );
      }
    }
  );
};

const Stop = () => {
  amqpRawValuesReceiver.stop();
};

module.exports.Start = Start;
module.exports.Stop = Stop;
