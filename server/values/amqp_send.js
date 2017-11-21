const amqp = require('amqplib/callback_api');
const moment = require('moment');
const logger = require('../logger');

process.env.CLOUDAMQP_URL = 'amqp://localhost';

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;
let reconnectionStarted = false;
function start() {
  reconnectionStarted = false;
  amqp.connect(`${process.env.CLOUDAMQP_URL}?heartbeat=60`, (err, conn) => {
    if (err) {
      logger.error('[AMQP]', err.message);
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
      }
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        logger.error('[AMQP] conn error', err.message);
      }
    });
    conn.on('close', () => {
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
        logger.error('[AMQP] reconnecting');
      }
    });

    logger.info('[AMQP] connected');
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
      logger.error('[AMQP] channel error', err.message);
    });
    ch.on('close', () => {
      logger.info('[AMQP] channel closed');
    });

    pubChannel = ch;
    while (true) {
      const m = offlinePubQueue.shift();
      logger.info('M = ', m);
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(exchange, routingKey, content, { persistent: true },
      (err, ok) => {
        if (err) {
          logger.error('[AMQP] publish', err);
          offlinePubQueue.push([ exchange, routingKey, content ]);
          pubChannel.connection.close();
        }
      });
  } catch (e) {
    logger.error('[AMQP] publish', e.message);
    offlinePubQueue.push([ exchange, routingKey, content ]);
  }
}

function closeOnErr(err) {
  if (!err) return false;
  logger.error('[AMQP] error', err);
  amqpConn.close();
  return true;
}

setInterval(() => {
  const dt = moment().format('YYYY-MM-DD HH:mm:ss');
  publish('', 'asutp.values.queue', new Buffer(`param${Math.floor(Math.random() * 10)}<>${Math.random() * 1000}<>NA<>${dt}`));
}, 3000);

start();
