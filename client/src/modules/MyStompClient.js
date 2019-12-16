import webstomp from "webstomp-client";

const TOPIC_VALUES = "/Values:";
const TOPIC_COMMANDS = "/Commands";

//const CMD_RELOAD = 'RELOAD';

//let locHost = 'localhost:3001';
let locConnectedCallback = null;

const CreateMySocketClient = function() {
  let stompClient;
  let subsciptionValues;

  //  let cbOnConnected = null;
  // let cbOnParamListsReceived = null;
  let paramsListName = "";
  // let cbOnParamsReceived = null;
  let cbOnValueReceived = null;

  const connectCallback = function() {
    console.log("[stompClient] connected");

    if (locConnectedCallback) {
      locConnectedCallback(null);
    }

    if (cbOnValueReceived) {
      if (subsciptionValues) {
        subsciptionValues.unsubscribe({});
      }

      if (paramsListName !== "") {
        subsciptionValues = stompClient.subscribe(
          TOPIC_VALUES + paramsListName,
          message => {
            // console.log(`[stompClient] received values: ${message}`);
            message.ack();

            if (cbOnValueReceived) {
              cbOnValueReceived(JSON.parse(message.body));
            }
          },
          {}
        );
      }
    }

    //  stompClient.send(TOPIC_COMMANDS, CMD_RELOAD, {});
  };

  const errorCallback = function(error) {
    console.warn(`[stompClient] stomp error: ${error}`); // not yet clean
    if (locConnectedCallback) {
      locConnectedCallback(error);
    }

    if (error.type === "close") {
      // eslint-disable-next-line
      setTimeout(MyStompClient.connect, 10000);
      console.log("[stompClient] reconnecting after 10 sec..");
    }
  };

  const headers = {
    login: "mylogin",
    passcode: "mypasscode",
    // additional header
    "client-id": "my-client-id"
  };

  this.connect = function(callback) {
    if (stompClient) {
      stompClient.disconnect();
      // stompClient._cleanUp();
    }

    if (callback !== undefined) {
      locConnectedCallback = callback;
    }

    // ws = new WebSocket(`ws://${location.host}`);

    // eslint-disable-next-line no-restricted-globals
    stompClient = webstomp.client(
      `ws://${window.location.hostname}:3001/stomp`
      // `ws://${window.location.hostname}/stomp`
    );
    // stompClient = webstomp.clienzt(`ws://${location.host}/stomp`);
    stompClient.heartbeat.outgoing = 2000;
    stompClient.heartbeat.incoming = 2000;
    // eslint-disable-next-line no-restricted-globals

    stompClient.debug = function(str) {
      // console.log(str);
    };

    stompClient.ws.onerror = err => {
      console.log(`[stompClient] socket error: ${err}`);
    };

    stompClient.ws.onclose = () => {
      console.log("[stompClient] socket disconnected");
      // if (!reconnectionStarted) {
      //   reconnectionStarted = true;
      //   setTimeout(connect, 10000);
      //   console.log('[stompClient] reconnecting after 10 sec..');
      // }
    };

    stompClient.connect(headers, connectCallback, errorCallback);
  };

  this.disconnect = function() {
    stompClient.disconnect();
    // stompClient._cleanUp();
  };

  this.sendCmd = function(data) {
    stompClient.send(TOPIC_COMMANDS, data, {});
  };

  this.subscribeToValues = function(aParamsListName, cb) {
    cbOnValueReceived = cb;
    if (stompClient !== undefined) {
      if (subsciptionValues) {
        subsciptionValues.unsubscribe({});
      }
      paramsListName = aParamsListName;
      subsciptionValues = stompClient.subscribe(
        TOPIC_VALUES + aParamsListName,
        message => {
          // console.log(`[stompClient] received values: ${message}`);
          message.ack();
          if (cbOnValueReceived) {
            cbOnValueReceived(JSON.parse(message.body));
          }
        },
        {}
      );
    }
  };

  this.unsubscribeFromValues = function() {
    cbOnValueReceived = null;
    if (stompClient !== undefined) {
      if (subsciptionValues) {
        subsciptionValues.unsubscribe({});
      }
    }
  };
};

const MyStompClient = new CreateMySocketClient();
MyStompClient.connect();
// const MyStompClient = { connect, disconnect, sendCmd, subscribeToValues };
export default MyStompClient;
