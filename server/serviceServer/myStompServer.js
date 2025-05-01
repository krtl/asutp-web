const StompServer = require("stomp-broker-js");
// const moment = require('moment');
const MyDataModelSchemas = require("../models/myDataModelSchemas");
const lastParamValues = require("./lastParamValues");
const MyServerStatus = require("./serverStatus");
const MyAirAlarms = require("./airAlarms");

const logger = require("../logger");

const TOPIC_VALUES = "/Values:";
const TOPIC_SERVER_STATUS = "/ServerStatus";
const TOPIC_COMMANDS = "/Commands";
const TOPIC_ACTIVE_AIR_ALARMS = "/AirAlarms";

const CMD_TEST = "TEST";

const traceMessages = false;

let stompServer;
let clientsConnected = 0;
// let timerId;

process
  .on("unhandledRejection", (reason, p) => {
    const s = `Unhandled Rejection at Promise: ${reason}  ${p}`;
    logger.error(s);
    // eslint-disable-next-line no-console
    console.error(s);
    process.exit(1);
  })
  .on("uncaughtException", err => {
    const s = `Uncaught Exception thrown: ${err.message} \r\n callstack: ${err.stack}`;
    logger.error(s);
    // eslint-disable-next-line no-console
    console.error(s);
    process.exit(1);
  });

const initializeStompServer = httpserver => {
  stompServer = new StompServer({ server: httpserver });

  stompServer.on("connected", socket => {
    if (traceMessages) {
      logger.debug(`[stompServer] Client ${socket.sessionId} connected`);
    }
    clientsConnected += 1;
    MyServerStatus.setWSocketStatus({ clientsConnected });
    MyServerStatus.addClient(`${socket._socket.remoteAddress.replace("::ffff:", "")}:${socket._socket.remotePort}`);
    
    // for (let prop in socket._socket) {
    //   console.log(`[stompServer] Client.socet._socket ${prop}`);
      // logger.debug(`[stompServer] Client ${prop} = ${socket[prop]}`);
    //}
  });

  stompServer.on("connecting", sessionId => {
    if (traceMessages) {
      logger.verbose(`[stompServer] Client ${sessionId} connecting..`);
    }
  });

  stompServer.on("disconnected", socket => {
    if (traceMessages) {
      logger.debug(`[stompServer] Client ${socket.sessionId} disconnected`);
    }
    clientsConnected -= 1;
    MyServerStatus.setWSocketStatus({ clientsConnected });
    MyServerStatus.removeClient(`${socket._socket.remoteAddress.replace("::ffff:", "")}:${socket._socket.remotePort}`);
  });

  stompServer.on("error", err => {
    if (traceMessages) {
      if (err) {
        logger.warn(
          `[stompServer] Client connection error: ${err.code} Stack: ${err.stack}`
        );
      }
    }
  });

  stompServer.on("send", ev => {
    if (traceMessages) {
      logger.verbose(
        `[stompServer] Broker send message "${ev.frame.body}" to ${ev.dest}`
      );

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

  stompServer.on("subscribe", ev => {
    if (traceMessages) {
      logger.debug(
        `[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`
      );
    }

    if (ev.topic === TOPIC_SERVER_STATUS) {
      const serverStatus = MyServerStatus.getServerStatus();
      if (serverStatus) {
        stompServer.sendIndividual(
          ev.socket,
          TOPIC_SERVER_STATUS,
          {},
          JSON.stringify(serverStatus)
        );
      }
      } else if (ev.topic === TOPIC_ACTIVE_AIR_ALARMS) {
        const activeAirAlarms = MyAirAlarms.GetActiveAirAlarms();
        if (activeAirAlarms) {
          stompServer.sendIndividual(
            ev.socket,
            TOPIC_ACTIVE_AIR_ALARMS,
            {},
            JSON.stringify(activeAirAlarms)
          );
        }
      } else if (ev.topic.startsWith(TOPIC_VALUES)) {
      const schemaName = ev.topic.replace(TOPIC_VALUES, "");
      const paramNames = MyDataModelSchemas.GetSchemaParamNamesAsArray(
        `schema_of_${schemaName}`
      );
      for (let i = 0; i < paramNames.length; i += 1) {
        const paramName = paramNames[i];
        const paramValue = lastParamValues.getLastValue(paramName);
        if (paramValue) {
          stompServer.sendIndividual(
            ev.socket,
            TOPIC_VALUES + schemaName,
            {},
            JSON.stringify(paramValue)
          );
        }
      }
    }
  });

  stompServer.on("unsubscribe", ev => {
    if (traceMessages) {
      logger.debug(
        `[stompServer] Client ${ev.sessionId} unsubscribed from ${ev.topic}`
      );
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

const sendServerStatus = serverStatus => {
  if (StompServer) {
    stompServer.send(TOPIC_SERVER_STATUS, {}, JSON.stringify(serverStatus));
  }
};

const sendActiveAirAlarms = airAlarms => {
  if (StompServer) {
    stompServer.send(TOPIC_ACTIVE_AIR_ALARMS, {}, JSON.stringify(airAlarms));
  }
};

const finalizeStompServer = () => {
  // clearInterval(timerId);
};

module.exports.initializeStompServer = initializeStompServer;
module.exports.finalizeStompServer = finalizeStompServer;
module.exports.sendParamValue = sendParamValue;
module.exports.sendNodeStateValue = sendNodeStateValue;
module.exports.sendServerStatus = sendServerStatus;
module.exports.sendActiveAirAlarms = sendActiveAirAlarms;
