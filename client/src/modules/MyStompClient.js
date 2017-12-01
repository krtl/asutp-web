import webstomp from 'webstomp-client';

const TOPIC_PARAM_LIST = '/ParamLists';
const TOPIC_PARAMS = '/Params';
// const TOPIC_VALUES = '/Values';
const TOPIC_COMMANDS = '/Commands';

const CMD_RELOAD = 'RELOAD';

const CreateMySocketClient = function () {
  let stompClient;
  let subsciptionParamLists;
  let subsciptionParams;
  let subsciptionValues;

  const connectCallback = function () {
    console.log('connected');

    if (subsciptionParamLists) {
      subsciptionParamLists.unsubscribe({});
    }
    subsciptionParamLists = stompClient.subscribe(TOPIC_PARAM_LIST, (message) => {
      console.log(`[stompClient] received Lists: ${message}`);
      message.ack();
    }, {});

    if (subsciptionParams) {
      subsciptionParams.unsubscribe({});
    }
    subsciptionParams = stompClient.subscribe(TOPIC_PARAMS, (message) => {
      console.log(`[stompClient] received Params: ${message}`);
      message.ack();
    }, {});

    if (subsciptionValues) {
      subsciptionValues.unsubscribe({});
    }
    // subsciptionValues = stompClient.subscribe(TOPIC_VALUES, (message) => {
    //   console.log(`[stompClient] received values: ${message}`);
    //   message.ack();
    // }, {});


    stompClient.send(TOPIC_COMMANDS, CMD_RELOAD, {});
  };

  const errorCallback = function (error) {
    console.warn(error.headers.message);
  };

  const headers = {
    'login': 'mylogin',
    'passcode': 'mypasscode',
    // additional header
    'client-id': 'my-client-id',
  };

  this.connect = function (doOnReceived) {
    if (stompClient) {
      stompClient.disconnect();
      // stompClient._cleanUp();
    }

    // ws = new WebSocket(`ws://${location.host}`);
    stompClient = webstomp.client(`ws://${location.host}/stomp`);
    stompClient.heartbeat.outgoing = 2000;
    stompClient.heartbeat.incoming = 2000;

    stompClient.debug = function (str) {
      console.log(str);
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
    if (stompClient !== undefined){
      if (subsciptionParamLists) {
        subsciptionParamLists.unsubscribe({});
      }
      subsciptionParamLists = stompClient.subscribe(TOPIC_PARAM_LIST, (message) => {
        console.log(`[stompClient] received ParamLists: ${message}`);
        message.ack();
        cb(message.json());
      }, {});
    }
  };

  this.subscribeToValues = function (topic) {
    if (subsciptionValues) {
      subsciptionValues.unsubscribe({});
    }
    subsciptionValues = stompClient.subscribe(topic, (message) => {
      console.log(`[stompClient] received values: ${message}`);
      message.ack();
    }, {});
  };
};

const MyStompClient = new CreateMySocketClient();
// const MyStompClient = { connect, disconnect, sendCmd, subscribeToValues };
export default MyStompClient;

