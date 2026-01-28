import webstomp from "webstomp-client";

const TOPIC_VALUES = "/Values:";
const TOPIC_SERVER_STATUS = "/ServerStatus";
const TOPIC_COMMANDS = "/Commands";
const TOPIC_ACTIVE_AIR_ALARMS = "/AirAlarms";

//const CMD_RELOAD = 'RELOAD';

//let locHost = 'localhost:3001';
let locConnectedCallback = null;

const CreateMySocketClient = function () {
  let stompClient;
  let subsciptionValues;
  let subsciptionServerStatus;
  let subsciptionAirAlarms;


  //  let cbOnConnected = null;
  let paramsListName = "";
  let subscribedToServerStatus = false;
  let subscribedToAirAlarms = false;
  // let cbOnParamsReceived = null;
  let cbOnValueReceived = null;
  let cbOnServerStatusReceived = null;
  let cbOnAirAlarmsReceived = null;

  const connectCallback = function () {
    console.log("[stompClient] connected");

    if (locConnectedCallback) {
      locConnectedCallback("connected");
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

    if (cbOnServerStatusReceived) {
      if (subsciptionServerStatus) {
        subsciptionServerStatus.unsubscribe({});
      }

      if (subscribedToServerStatus) {
        subsciptionServerStatus = stompClient.subscribe(
          TOPIC_SERVER_STATUS,
          message => {
            // console.log(`[stompClient] received ServerStatus: ${message}`);
            message.ack();

            if (cbOnServerStatusReceived) {
              cbOnServerStatusReceived(JSON.parse(message.body));
            }
          },
          {}
        );
      }
    }

    if (cbOnAirAlarmsReceived) {
      if (subsciptionAirAlarms) {
        subsciptionAirAlarms.unsubscribe({});
      }

      if (subscribedToAirAlarms) {
        subsciptionAirAlarms = stompClient.subscribe(
          TOPIC_ACTIVE_AIR_ALARMS,
          message => {
            // console.log(`[stompClient] received AirAlarms: ${message}`);
            message.ack();

            if (cbOnAirAlarmsReceived) {
              cbOnAirAlarmsReceived(JSON.parse(message.body));
            }
          },
          {}
        );
      }
    }

    //  stompClient.send(TOPIC_COMMANDS, CMD_RELOAD, {});
  };

  const errorCallback = function (error) {
    console.warn(`[stompClient] stomp error: ${error}`); // not yet clean

    let locConnectionStatus = "error";
    if (error.type === "close") {
      locConnectionStatus = "closed";
      // eslint-disable-next-line
      setTimeout(MyStompClient.connect, 10000);
      console.log("[stompClient] reconnecting after 10 sec..");
    } else {
      locConnectionStatus = error.type;
          if (error.reason) locConnectionStatus += ` ${error.reason}`;
    }

    if (locConnectedCallback) {
      locConnectedCallback(locConnectionStatus);
    }    
  };

  const headers = {
    login: "mylogin",
    passcode: "mypasscode",
    // additional header
    "client-id": "my-client-id"
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

    // eslint-disable-next-line no-restricted-globals
    stompClient = webstomp.client(
       `ws://${window.location.hostname}:3001/stomp`
      //  `wss://${window.location.hostname}/stomp`
    );
    // stompClient = webstomp.clienzt(`ws://${location.host}/stomp`);
    stompClient.heartbeat.outgoing = 2000;
    stompClient.heartbeat.incoming = 2000;
    // eslint-disable-next-line no-restricted-globals

    stompClient.debug = function (str) {
      // console.log(str);
    };

    stompClient.ws.onerror = err => {
      console.log(`[stompClient] socket error: ${err.message}`);
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

  this.disconnect = function () {
    stompClient.disconnect();
    // stompClient._cleanUp();
  };

  this.sendCmd = function (data) {
    stompClient.send(TOPIC_COMMANDS, data, {});
  };

  this.subscribeToValues = function (aParamsListName, cb) {
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

  this.unsubscribeFromValues = function () {
    cbOnValueReceived = null;
    if (stompClient !== undefined) {
      if (subsciptionValues) {
        subsciptionValues.unsubscribe({});
        subsciptionValues = null;
      }
    }
  };

  this.subscribeToServerStatus = function (cb) {
    cbOnServerStatusReceived = cb;
    if (stompClient !== undefined) {
      if (subsciptionServerStatus) {
        subsciptionServerStatus.unsubscribe({});
      }
      subscribedToServerStatus = true;
      subsciptionServerStatus = stompClient.subscribe(
        TOPIC_SERVER_STATUS,
        message => {
          // console.log(`[stompClient] received ServerStatus: ${message}`);
          message.ack();
          if (cbOnServerStatusReceived) {
            cbOnServerStatusReceived(JSON.parse(message.body));
          }
        },
        {}
      );
    }
  };

  this.unsubscribeFromServerStatus = function () {
    cbOnServerStatusReceived = null;
    if (stompClient !== undefined) {
      if (subsciptionServerStatus) {
        subsciptionServerStatus.unsubscribe({});
        subsciptionServerStatus = null;
      }
    }
  };

  this.subscribeToActiveAirAlarms = function (cb) {
    cbOnAirAlarmsReceived = cb;
    if (stompClient !== undefined) {
      if (subsciptionAirAlarms) {
        subsciptionAirAlarms.unsubscribe({});
      }
      subscribedToAirAlarms = true;
      subsciptionAirAlarms = stompClient.subscribe(
        TOPIC_ACTIVE_AIR_ALARMS,
        message => {
          // console.log(`[stompClient] received AirAlarms: ${message}`);
          message.ack();
          if (cbOnAirAlarmsReceived) {
            cbOnAirAlarmsReceived(JSON.parse(message.body));
          }
        },
        {}
      );
    }
  };

  this.unsubscribeFromActiveAirAlarms = function () {
    cbOnAirAlarmsReceived = null;
    if (stompClient !== undefined) {
      if (subsciptionAirAlarms) {
        subsciptionAirAlarms.unsubscribe({});
        subsciptionAirAlarms = null;
      }
    }
  };

  this.setConnectedCallback = cb => {
    locConnectedCallback = cb;
  };

};

const MyStompClient = new CreateMySocketClient();
MyStompClient.connect();
// const MyStompClient = { connect, disconnect, sendCmd, subscribeToValues };
export default MyStompClient;
