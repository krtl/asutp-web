const MyStompClient = require('./MyStompClient');
const logger = require('../server/logger');


// const doOnWebsocketDataReceived = (data) => {
//   console.log(`Received: ${data}`);
// };

MyStompClient.connect('127.0.0.1:3001', (err) => {
  if (err) {
    return;
  }
  MyStompClient.loadParamLists((paramLists) => {
    if (paramLists.length > 0) {
      const listName = paramLists[0].name; // paramLists.slice(0, MATCHING_PARAMS_LIMIT);
      MyStompClient.loadParams(listName, (params) => {
        MyStompClient.subscribeToValues(listName, (value) => {
          logger.trace(value);

        });
        MyStompClient.disconnect();
      });
    }
  });
},
);
