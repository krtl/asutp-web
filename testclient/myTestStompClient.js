const MyStompClient = require('./MyStompClient');


// const doOnWebsocketDataReceived = (data) => {
//   console.log(`Received: ${data}`);
// };

MyStompClient.connect('127.0.0.1:3001');

