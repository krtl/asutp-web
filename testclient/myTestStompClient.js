const MyStompClient = require('./MyStompClient');
const logger = require('../server/logger');


// const doOnWebsocketDataReceived = (data) => {
//   console.log(`Received: ${data}`);
// };


MyStompClient.subscribeToValues('restSchema', (value) => {
  logger.trace(value);
});

MyStompClient.connect('127.0.0.1:3001', (err) => {
  if (!err) {
    MyStompClient.connect('127.0.0.1:3001', (err) => {
      if (!err) {
        MyStompClient.connect('127.0.0.1:3001', (err) => {
          if (!err) {
            //
          }
        });
      }
    });
  }
});
