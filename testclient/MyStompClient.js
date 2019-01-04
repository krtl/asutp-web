const WebSocket = require('ws');
const webstomp = require('webstomp-client');

const TOPIC_PARAM_LIST = '/ParamLists';
const TOPIC_PARAMS = '/Params:';
const TOPIC_VALUES = '/Values:';
const TOPIC_COMMANDS = '/Commands';

const CMD_RELOAD = 'RELOAD';

let locHost = 'localhost';
let locConnectedCallback = null;

let stompClient;
let subsciptionParamLists;
let subsciptionParams;
let subsciptionValues;

let cbOnParamListsReceived = null;
let paramsListName = '';
let cbOnParamsReceived = null;
let cbOnValueReceived = null;

let reconnectionStarted = false;


const connectCallback = () => {
  console.log('connected');

  if (locConnectedCallback) {
    locConnectedCallback(null);
  }

  // if (subsciptionParamLists) {
  //   subsciptionParamLists.unsubscribe({});
  // }

  subsciptionParamLists = stompClient.subscribe(TOPIC_PARAM_LIST, (message) => {
    console.log(`[stompClient] received ParamLists: ${message}`);
    message.ack();

    if (cbOnParamListsReceived) {
      cbOnParamListsReceived(JSON.parse(message.body));
    }
  }, {});

  // if (subsciptionParams) {
  //   subsciptionParams.unsubscribe({});
  // }

  // if (subsciptionValues) {
  //   subsciptionValues.unsubscribe({});
  // }

  if (paramsListName !== '') {
    subsciptionParams = stompClient.subscribe(TOPIC_PARAMS + paramsListName, (message) => {
      console.log(`[stompClient] received Params: ${message}`);
      message.ack();

      if (cbOnParamsReceived) {
        cbOnParamsReceived(JSON.parse(message.body));
      }
    }, {});

    subsciptionValues = stompClient.subscribe(TOPIC_VALUES + paramsListName, (message) => {
      console.log(`[stompClient] received values: ${message}`);
      message.ack();

      if (cbOnValueReceived) {
        cbOnValueReceived(JSON.parse(message.body));
      }
    }, {});
  }

  stompClient.send(TOPIC_COMMANDS, CMD_RELOAD, {});
};


const errorCallback = (error) => {
  console.warn(error); // not yet clean
  if (locConnectedCallback) {
    locConnectedCallback(error);
  }
};

const headers = {
  'login': 'mylogin',
  'passcode': 'mypasscode',
  // additional header
  'client-id': 'my-client-id',
};

const connect = (host, callback) => {
  // if (stompClient) {
  //   stompClient.disconnect();
  //   // stompClient._cleanUp();
  // }

  if (host !== undefined) {
    locHost = host;
  }

  if (callback !== undefined) {
    locConnectedCallback = callback;
  }

  reconnectionStarted = false;


  const options = { debug: false, protocols: webstomp.VERSIONS.supportedProtocols() };
  const ws = new WebSocket(`ws://${locHost}/stomp`);
  // stompClient = webstomp.client(`ws://${locHost}/stomp`);
  ws.on('error', (err) => {
    console.log(`[!] error: ${err}`);
  });
  ws.on('close', () => {
    console.log('[!] disconnected');
    if (!reconnectionStarted) {
      reconnectionStarted = true;
      setTimeout(connect, 7000);
      console.log('reconnecting..');
    }
  });

  stompClient = webstomp.over(ws, options);
  stompClient.heartbeat.outgoing = 2000;
  stompClient.heartbeat.incoming = 2000;

  stompClient.debug = (str) => {
    console.log(str);
  };

  stompClient.connect(headers, connectCallback, errorCallback);
};

const disconnect = () => {
  stompClient.disconnect();
  // stompClient._cleanUp();
};

const sendCmd = (data) => {
  stompClient.send(TOPIC_COMMANDS, data, {});
};

const loadParamLists = (cb) => {
  cbOnParamListsReceived = cb;
  if (stompClient !== undefined) {
    if (subsciptionParamLists) {
      subsciptionParamLists.unsubscribe({});
    }
    subsciptionParamLists = stompClient.subscribe(TOPIC_PARAM_LIST, (message) => {
      console.log(`[stompClient] received ParamLists: ${message}`);
      message.ack();
      cb(JSON.parse(message.body));
    }, {});
  }
};

const loadParams = (aParamsListName, cb) => {
  paramsListName = aParamsListName;
  cbOnParamsReceived = cb;
  if (stompClient !== undefined) {
    if (subsciptionParams) {
      subsciptionParams.unsubscribe({});
    }
    subsciptionParams = stompClient.subscribe(TOPIC_PARAMS + paramsListName, (message) => {
      console.log(`[stompClient] received Params: ${message}`);
      message.ack();
      cb(JSON.parse(message.body));
    }, {});
  }
};

const subscribeToValues = (aParamsListName, cb) => {
  cbOnValueReceived = cb;
  if (stompClient !== undefined) {
    if (subsciptionValues) {
      subsciptionValues.unsubscribe({});
    }
    subsciptionValues = stompClient.subscribe(TOPIC_VALUES + aParamsListName, (message) => {
      console.log(`[stompClient] received values: ${message}`);
      message.ack();
      cb(JSON.parse(message.body));
    }, {});
  }
};

const unsubscribeFromValues = () => {
  cbOnValueReceived = null;
  if (stompClient !== undefined) {
    if (subsciptionValues) {
      subsciptionValues.unsubscribe({});
    }
  }
};

module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.sendCmd = sendCmd;
module.exports.loadParamLists = loadParamLists;
module.exports.loadParams = loadParams;
module.exports.subscribeToValues = subscribeToValues;
module.exports.unsubscribeFromValues = unsubscribeFromValues;

