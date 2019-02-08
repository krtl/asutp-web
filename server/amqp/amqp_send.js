const amqp = require('amqplib/callback_api');
// const moment = require('moment');
const logger = require('../logger');
// const config = require('../../config');

// process.env.CLOUDAMQP_URL = 'amqp://localhost';

let locAmpqURI = '';

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;
let reconnectionStarted = false;
function start(ampqURI) {
  if (ampqURI !== undefined) locAmpqURI = ampqURI;

  reconnectionStarted = false;
  amqp.connect(`${locAmpqURI}?heartbeat=60`, (err, conn) => {
    if (err) {
      logger.error(`[AMQPSENDER] ${err.message}`);
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
      }
      return;
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        logger.error(`[AMQPSENDER] conn error ${err.message}`);
      }
    });
    conn.on('close', () => {
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
        logger.error('[AMQPSENDER] reconnecting');
      }
    });

    logger.info(`[AMQPSENDER] connected to ${locAmpqURI}`);

    amqpConn = conn;

    whenConnected();
  });
}

function whenConnected() {
  startPublisher();
}

let pubChannel = null;
const offlinePubQueue = [];
function startPublisher() {
  amqpConn.createConfirmChannel((err, ch) => {
    if (closeOnErr(err)) return;
    ch.on('error', (err) => {
      logger.error(`[AMQPSENDER] channel error ${err.message}`);
    });
    ch.on('close', () => {
      logger.info('[AMQPSENDER] channel closed');
    });

    pubChannel = ch;
    let b = true;
    while (b) {
      const m = offlinePubQueue.shift();
      if (m) {
        logger.debug('Publishing from offline quieue');
        publish(m[0], m[1], m[2]);
      } else {
        b = false;
      }
    }
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {
  if (pubChannel === null) {
    offlinePubQueue.push([ exchange, routingKey, content ]);
  } else {
    try {
      pubChannel.publish(exchange, routingKey, content, { persistent: true },
        (err) => {
          if (err) {
            logger.error(`[AMQPSENDER] publish ${err}`);
            offlinePubQueue.push([ exchange, routingKey, content ]);
            pubChannel.connection.close();
          }
        });
    } catch (e) {
      logger.error(`[AMQPSENDER] publish ${e.message}`);
      offlinePubQueue.push([ exchange, routingKey, content ]);
    }
  }
}

function closeOnErr(err) {
  if (!err) return false;
  logger.error(`[AMQPSENDER] error ${err}`);
  amqpConn.close();
  return true;
}

const send = (amqpValuesQueueName, message) => {
  publish('', amqpValuesQueueName, Buffer.from(message));
};


module.exports.start = start;
module.exports.send = send;
