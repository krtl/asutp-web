const StompServer = require('stomp-broker-js');
// const moment = require('moment');
const MyDataModelNodes = require('../models/myDataModelNodes');
const lastValues = require('./lastValues');


// var StompServer = require('server/values/myStompServer');
// const WebSocket = require('ws');
// const randomstring = require('randomstring');
const logger = require('../logger');

const TOPIC_VALUES = '/Values:';
const TOPIC_COMMANDS = '/Commands';

const CMD_TEST = 'TEST';


const traceMessages = true;

let stompServer;
// let timerId;

process
.on('unhandledRejection', (reason, p) => {
  const s = `Unhandled Rejection at Promise: ${reason}  ${p}`;
  logger.error(s);
  // eslint-disable-next-line no-console
  console.error(s);
  process.exit(1);
})
.on('uncaughtException', (err) => {
  const s = `Uncaught Exception thrown: ${err.message} \r\n callstack: ${err.stack}`;
  logger.error(s);
  // eslint-disable-next-line no-console
  console.error(s);
  process.exit(1);
});

const initializeStompServer = (httpserver) => {
  stompServer = new StompServer({ server: httpserver });

  stompServer.on('connected', (sessionId) => {
    if (traceMessages) {
      logger.debug(`[stompServer] Client ${sessionId} connected`);
    }
  });

  stompServer.on('connecting', (sessionId) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${sessionId} connecting..`);
    }
  });

  stompServer.on('disconnected', (sessionId) => {
    if (traceMessages) {
      logger.debug(`[stompServer] Client ${sessionId} disconnected`);
    }
  });

  stompServer.on('error', (err) => {
    if (traceMessages) {
      if (err) {
        logger.warn(`[stompServer] Client connection error: ${err.code} Stack: ${err.stack}`);
      }
    }
  });

  stompServer.on('send', (ev) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Broker send message "${ev.frame.body}" to ${ev.dest}`);

      switch (ev.dest) {
        case TOPIC_COMMANDS: {
          if (ev.frame.body === CMD_TEST) {
            // ..
          }
          break;
        }
        default:

      }
    }
  });

  stompServer.on('subscribe', (ev) => {
    if (traceMessages) {
      logger.debug(`[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`);
    }

    if (ev.topic.startsWith(TOPIC_VALUES)) {
      const schemaName = ev.topic.replace(TOPIC_VALUES, '');
      const paramNames = MyDataModelNodes.GetPSSchemaParamNames(schemaName);
      for (let i = 0; i < paramNames.length; i += 1) {
        const paramName = paramNames[i];
        const paramValue = lastValues.getLastValue(paramName);
        if (paramValue) {
          stompServer.sendIndividual(ev.socket, TOPIC_VALUES + schemaName, {}, JSON.stringify(paramValue));
        }
      }
    }
  });

  stompServer.on('unsubscribe', (ev) => {
    if (traceMessages) {
      logger.debug(`[stompServer] Client ${ev.sessionId} unsubscribed from ${ev.topic}`);
    }
  });

  // timerId = setInterval(() => {
  //   // .. for future use
  // }, 3000);
};

const sendParamValue = (listName, paramValue) => {
  if (StompServer) {
    stompServer.send(TOPIC_VALUES + listName, {}, JSON.stringify(paramValue));
  }
};

const sendNodeStateValue = (listName, stateValue) => {
  if (StompServer) {
    stompServer.send(TOPIC_VALUES + listName, {}, JSON.stringify(stateValue));
  }
};

const finalizeStompServer = () => {
  // clearInterval(timerId);
};


module.exports.initializeStompServer = initializeStompServer;
module.exports.finalizeStompServer = finalizeStompServer;
module.exports.sendParamValue = sendParamValue;
module.exports.sendNodeStateValue = sendNodeStateValue;
