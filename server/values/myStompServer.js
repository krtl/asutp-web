const StompServer = require('stomp-broker-js');
const moment = require('moment');
const MyDataModel = require('../models/myDataModel');
const lastValues = require('./lastValues');
const MyParamValue = require('../models/myParamValue');

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
      logger.verbose(`[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`);
    }

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
      const params = MyDataModel.GetParamsOfList(locParamListName);
      stompServer.sendIndividual(ev.socket, ev.topic, {}, JSON.stringify(params));
    }

    if (ev.topic.startsWith(TOPIC_VALUES)) {
      const locParamListName = ev.topic.replace(TOPIC_VALUES, '');
      const params = MyDataModel.GetParamsOfList(locParamListName);
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

  const dt = moment();// .format('YYYY-MM-DD HH:mm:ss');
  for (let i = 0; i < 10; i++) {
    const obj = new MyParamValue(`param${i}`, Math.random(), Math.random() * 1000, dt, 'NA');
    lastValues.setLastValue(obj);
  }


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


    const dt = moment();// .format('YYYY-MM-DD HH:mm:ss');
    const obj = new MyParamValue(`param${Math.floor(Math.random() * 10)}`, Math.random(), Math.random() * 1000, dt, 'NA');

    lastValues.setLastValue(obj);

    const param = MyDataModel.GetParam(obj.paramName);
    param.listNames.forEach((lstName) => {
      stompServer.send(TOPIC_VALUES + lstName, {}, JSON.stringify(obj));
    });
  }, 10000);
};

const finalizeStompServer = function () {
  clearInterval(timerId);
};


module.exports.initializeStompServer = initializeStompServer;
module.exports.finalizeStompServer = finalizeStompServer;
