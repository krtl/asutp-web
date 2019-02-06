const MyParamValue = require('../models/myParamValue');
const config = require('../../config');
const amqpRawValuesReceiver = require('../amqp/amqp_receive');
const lastValues = require('../values/lastValues');
const logger = require('../logger');
const moment = require('moment');

const Start = () => {
  amqpRawValuesReceiver.start(config.amqpUri, config.amqpRawValuesQueueName, (received) => {
    logger.verbose(`[RawValuesReceiver] Got msg ${received}`);

      // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
    const s = received.split('<>');
    if (s.length === 4) {
      const momentDT = moment(s[3]);
      const dt = new Date(momentDT);
      const float = parseFloat(s[1].replace(',', '.'));
      const obj = new MyParamValue(s[0], float, dt, s[2]);

      lastValues.setLastValue(obj);
    } else {
      logger.error(`[RawValuesReceiver][MyParamValue] Failed to parse:  ${received}`);
    }
  });
};

module.exports.Start = Start;
