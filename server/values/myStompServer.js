const StompServer = require('stomp-broker-js');
// const moment = require('moment');
const MyDataModelParams = require('../models/myDataModelParams');
const lastValues = require('./lastValues');
const MyParamJsonSerialize = require('../models/myParam').MyParamJsonSerialize;


// var StompServer = require('server/values/myStompServer');
// const WebSocket = require('ws');
// const randomstring = require('randomstring');
const logger = require('../logger');

const TOPIC_PARAM_LIST = '/ParamLists';
const TOPIC_PARAMS = '/Params:';
const TOPIC_VALUES = '/Values:';
const TOPIC_COMMANDS = '/Commands';

const CMD_RELOAD = 'RELOAD';


const traceMessages = true;

let stompServer;
let timerId;

const initializeStompServer = (httpserver) => {
  stompServer = new StompServer({ server: httpserver });

  stompServer.on('connected', (sessionId) => {
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
            const paramLists = MyDataModelParams.GetAvailableParamsLists('');
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
      logger.verbose(`[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`);
    }

    switch (ev.topic) {
      case TOPIC_PARAM_LIST: {
        const paramLists = MyDataModelParams.GetAvailableParamsLists('');
        stompServer.sendIndividual(ev.socket, TOPIC_PARAM_LIST, {}, JSON.stringify(paramLists));
        break;
      }
      default:

    }

    if (ev.topic.startsWith(TOPIC_PARAMS)) {
      const locParamListName = ev.topic.replace(TOPIC_PARAMS, '');
      const params = MyDataModelParams.GetParamsOfList(locParamListName);
      stompServer.sendIndividual(ev.socket, ev.topic, {}, MyParamJsonSerialize(params));
    }

    if (ev.topic.startsWith(TOPIC_VALUES)) {
      const locParamListName = ev.topic.replace(TOPIC_VALUES, '');
      const params = MyDataModelParams.GetParamsOfList(locParamListName);
      params.forEach((param) => {
        const paramValue = lastValues.getLastValue(param.name);
        if (paramValue) {
          stompServer.sendIndividual(ev.socket, TOPIC_VALUES + locParamListName, {}, JSON.stringify(paramValue));
        }
      });
    }
  });

  stompServer.on('unsubscribe', (ev) => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${ev.sessionId} unsubscribed from ${ev.topic}`);
    }
  });

  timerId = setInterval(() => {
    // .. for future use


    // const headers = { id: 'sub-0' };
    // stompServer.subscribe(`${TOPIC_PARAMS}paramList1`, (msg, headers) => {
    //   const topic = headers.destination;
    //
    //   if (traceMessages) {
    //     logger.verbose(`[stompServer] topic: ${topic} received: ${msg}`);
    //   }
    // }, headers);

    // stompServer.subscribe(`${TOPIC_VALUES}paramList1`, (msg, headers) => {
    //   const topic = headers.destination;
    //
    //   if (traceMessages) {
    //     logger.verbose(`[stompServer] topic: ${topic} received: ${msg}`);
    //   }
    // }, headers);


    const lastChanged = lastValues.getLastChanged();
    lastChanged.forEach((paramName) => {
      const value = lastValues.getLastValue(paramName);
      const param = MyDataModelParams.GetParam(paramName);
      if ((param) && (value)) {
        param.listNames.forEach((lstName) => {
          stompServer.send(TOPIC_VALUES + lstName, {}, JSON.stringify(value));
        });
      }
    });
  }, 10000);
};

const finalizeStompServer = () => {
  clearInterval(timerId);
};


module.exports.initializeStompServer = initializeStompServer;
module.exports.finalizeStompServer = finalizeStompServer;
