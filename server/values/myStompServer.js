const StompServer = require('stomp-broker-js');
const MyDataModel = require('../models/myDataModel');

// var StompServer = require('server/values/myStompServer');
// const WebSocket = require('ws');
// const randomstring = require('randomstring');
const logger = require('../logger');

const TOPIC_PARAM_LIST = '/ParamLists';
const TOPIC_PARAMS = '/Params';
const TOPIC_VALUES = '/Values';
const TOPIC_COMMANDS = '/Commands';

const CMD_RELOAD = 'RELOAD';


const traceMessages = true;

let stompServer;
let timerId;

const initializeStompServer = function (httpserver) {
  stompServer = new StompServer({ server: httpserver });

  stompServer.on('connected', (sessionId, headers) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${sessionId} connected`);
    }
  });

  stompServer.on('connecting', (sessionId) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${sessionId} connecting..`);
    }
  });

  stompServer.on('disconnected', (sessionId) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${sessionId} disconnected`);
    }
  });

  stompServer.on('send', (ev) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Broker send message "${ev.frame.body}" to ${ev.dest}`);

      switch (ev.dest) {
        case TOPIC_COMMANDS: {
          if (ev.frame.body === CMD_RELOAD) {
            const paramLists = MyDataModel.GetAvailableParamsLists('');
            stompServer.sendIndividual(ev.socket, TOPIC_PARAM_LIST, {}, JSON.stringify(paramLists));
          }
          break;
        }
        default:

      }
    }
  });

  stompServer.on('subscribe', (ev) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${ev.sessionId} sunbscribed to ${ev.topic}`);

      switch (ev.topic) {
        case TOPIC_PARAM_LIST: {
          const paramLists = MyDataModel.GetAvailableParamsLists('');
          stompServer.sendIndividual(ev.socket, TOPIC_PARAM_LIST, {}, JSON.stringify(paramLists));
          break;
        }
        default:

      }

      if (ev.topic.startsWith(TOPIC_PARAMS)) {
        const locParamListName = ev.topic.replace(TOPIC_PARAMS, '');
        const params = MyDataModel.GetParamsList(locParamListName);
        if (params) {
          stompServer.sendIndividual(ev.socket, TOPIC_PARAMS, {}, JSON.stringify(params));
        } else {
          logger.warn(`[stompServer] ParamList ${locParamListName} not found! Client: ${ev.sessionId}`);
        }
      }
    }
  });

  stompServer.on('unsubscribe', (ev) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${ev.sessionId} unsunbscribed from ${ev.topic}`);
    }
  });

  const headers = { id: 'sub-0' };
  stompServer.subscribe('/queue/test', (msg, headers) => {
    const topic = headers.destination;

    if (traceMessages) {
      logger.verbose(`[stompServer] topic: ${topic} received: ${msg}`);
    }
  }, headers);


  timerId = setInterval(() => {

    // .. for future use

  }, 10000);
};

const finalizeStompServer = function () {
  clearInterval(timerId);
};


module.exports.initializeStompServer = initializeStompServer;
module.exports.finalizeStompServer = finalizeStompServer;
