import webstomp from 'webstomp-client';

const TOPIC_PARAM_LIST = '/ParamLists';
const TOPIC_PARAMS = '/Params:';
const TOPIC_VALUES = '/Values:';
const TOPIC_COMMANDS = '/Commands';

//const CMD_RELOAD = 'RELOAD';

//let locHost = 'localhost:3001';
let locConnectedCallback = null;


const CreateMySocketClient = function () {
  let stompClient;
  let subsciptionParamLists;
  let subsciptionParams;
  let subsciptionValues;

//  let cbOnConnected = null;
  let cbOnParamListsReceived = null;
  let paramsListName = '';
  let cbOnParamsReceived = null;
  let cbOnValueReceived = null;

  const connectCallback = function () {
    console.log('[stompClient] connected');

    if (locConnectedCallback) {
      locConnectedCallback(null);
    }  

    if (cbOnParamListsReceived) {

      if (subsciptionParamLists) {
        subsciptionParamLists.unsubscribe({});
      }

      subsciptionParamLists = stompClient.subscribe(TOPIC_PARAM_LIST, (message) => {
        console.log(`[stompClient] received ParamLists: ${message}`);
        message.ack();

        if (cbOnParamListsReceived) {
          cbOnParamListsReceived(JSON.parse(message.body));
        }
      }, {});
  }

  if (cbOnParamsReceived) {
    if (subsciptionParams) {
      subsciptionParams.unsubscribe({});
    }

    if (subsciptionValues) {
      subsciptionValues.unsubscribe({});
    }

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
  }

  //  stompClient.send(TOPIC_COMMANDS, CMD_RELOAD, {});
  };

  const errorCallback = function (error) {
    console.warn(`[stompClient] stomp error: ${error}`); // not yet clean
    if (locConnectedCallback) {
      locConnectedCallback(error);
    }

      if (error.type === 'close') {
        // eslint-disable-next-line
        setTimeout(MyStompClient.connect, 10000);
        console.log('[stompClient] reconnecting after 10 sec..');
      }    
  
  };

  const headers = {
    'login': 'mylogin',
    'passcode': 'mypasscode',
    // additional header
    'client-id': 'my-client-id',
  };

  this.connect = function (callback) {
    if (stompClient) {
      stompClient.disconnect();
      // stompClient._cleanUp();
    }

    if (callback !== undefined) {
      locConnectedCallback = callback;
    }  

    // ws = new WebSocket(`ws://${location.host}`);
    stompClient = webstomp.client(`ws://${location.host}/stomp`);
    stompClient.heartbeat.outgoing = 2000;
    stompClient.heartbeat.incoming = 2000;

    stompClient.debug = function (str) {
      console.log(str);
    };

    stompClient.ws.onerror = (err) => {
      console.log(`[stompClient] socket error: ${err}`);
    }

    stompClient.ws.onclose = () => {
      console.log('[stompClient] socket disconnected');
      // if (!reconnectionStarted) {
      //   reconnectionStarted = true;
      //   setTimeout(connect, 10000);
      //   console.log('[stompClient] reconnecting after 10 sec..');
      // }
    };    

    stompClient.connect(headers, connectCallback, errorCallback);
  };

  this.disconnect = function () {
    stompClient.disconnect();
    // stompClient._cleanUp();
  };

  this.sendCmd = function (data) {
    stompClient.send(TOPIC_COMMANDS, data, {});
  };

  this.loadParamLists = function (cb) {
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

  this.loadParams = function (aParamsListName, cb) {
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

  this.subscribeToValues = function (aParamsListName, cb) {
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

  this.unsubscribeFromValues = function () {
    cbOnValueReceived = null;
    if (stompClient !== undefined) {
      if (subsciptionValues) {
        subsciptionValues.unsubscribe({});
      }
    }
  };
};

const MyStompClient = new CreateMySocketClient();
// const MyStompClient = { connect, disconnect, sendCmd, subscribeToValues };
export default MyStompClient;

