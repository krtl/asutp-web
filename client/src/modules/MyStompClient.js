import webstomp from 'webstomp-client';


// let ws;
let stompClient;
let stompClientSubscription;

const connectCallback = function () {
  console.log('connected');

  stompClient.send('/queue/test', 'Hello, STOMP', { priority: 9 });
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

function connect(doOnReceived) {
  // if (ws) {
  //   ws.onerror = ws.onopen = ws.onclose = null;
  //   ws.close();
  // }

  // ws = new WebSocket(`ws://${location.host}`);
  stompClient = webstomp.client(`ws://${location.host}/stomp`);
  stompClient.heartbeat.outgoing = 2000;
  stompClient.heartbeat.incoming = 2000;

  stompClient.debug = function (str) {
    console.log(str);
  };

  stompClient.connect(headers, connectCallback, errorCallback);
}

function disconnect() {
  stompClient.disconnect();
//   if (ws) {
//     ws.onerror = ws.onopen = ws.onclose = null;
//     ws.close();
//   }
}

function send(data) {
  stompClient.send('/queue/test', data, {});
}

function subscribe(topic) {
  if (stompClientSubscription) {
    stompClientSubscription.unsubscribe(headers);
  }

  stompClientSubscription = stompClient.subscribe(topic, (message) => {
    console.log(`[stompClient] received: ${message}`);
    message.ack();
    // expect(message.body).to.equal(testMess);
  }, {});
}


const MyWebSocket = { connect, disconnect, send, subscribe };
export default MyWebSocket;
