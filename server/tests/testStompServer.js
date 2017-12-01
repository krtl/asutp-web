const http = require('http');
const StompServer = require('stomp-broker-js');
const WebSocket = require('ws');
const webstomp = require('webstomp-client');

const chai = require('chai');
const expect = chai.expect;
// const WebSocket = require('ws');
// const WebSocketServer = require('../values/webSocketServer');


const testCase = require('mocha').describe;
const before = require('mocha').before;
const after = require('mocha').after;
const assertions = require('mocha').it;
const assert = require('chai').assert;


const options = { debug: false, protocols: webstomp.VERSIONS.supportedProtocols() };
const testMess = 'This is the test message';
const testReplyMess = 'This is reply';
const testTopicServerToClient = '/ServerToClient';
const testTopicClientToServer = '/ClientToServer';

let server;
let stompServer;


describe('StompServer', () => {
  // let ss;
  let wsc;
  let stompClient;
  let stompClientSubscription;

  before(() => {
    server = http.createServer();
    stompServer = new StompServer({ server });

    stompServer.on('connected', (sessionId, headers) => {
      console.log(`[stompServer] Client ${sessionId} connected`);
    });

    stompServer.on('connecting', (sessionId) => {
      console.log(`[stompServer] Client ${sessionId} connecting..`);
    });

    stompServer.on('disconnected', (sessionId) => {
      console.log(`[stompServer] Client ${sessionId} disconnected`);
    });

    stompServer.on('send', (ev) => {
      console.log(`[stompServer] Broker send message "${ev.frame.body}" to ${ev.dest}`);
    });

    stompServer.on('subscribe', (ev) => {
      console.log(`[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`);
    });

    stompServer.on('unsubscribe', (ev) => {
      console.log(`[stompServer] Client ${ev.sessionId} unsunbscribed from ${ev.topic}`);
    });


    server.listen(33333);
  });

  after(() => {
    server.close();
  });


  // testCase('#send', () => {
  //   assertions('check msg and topic subscription', () => {
  //     const headers = { id: 'sub-0' };
  //     stompServer.subscribe('/**', (msg, headers) => {
  //       const topic = headers.destination;
  //       assert.equal(topic, '/data');
  //       assert.equal(msg, 'test body');
  //     }, headers);
  //     stompServer.send('/data', {}, 'test body');
  //   });
  // });
  //
  // testCase('#unsubscribe', () => {
  //   assertions('check topic unsubscribe', () => {
  //     const headers = { id: 'sub-0' };
  //     stompServer.subscribe('/**', (msg, headers) => {
  //       const subId = headers.subscription;
  //       assert.isTrue(stompServer.unsubscribe(subId), `unsubscribe successfull, subId: ${subId}`);
  //     }, headers);
  //   });
  // });


  beforeEach((done) => {
    wsc = new WebSocket('ws://localhost:33333/stomp');
    stompClient = webstomp.over(wsc, options);

    const connectCallback = function () {
      console.log('[stompClient] connected');
//  stompClient.send('/queue/test', { priority: 9 }, 'Hello, STOMP');
      done();
    };

    const errorCallback = function (error) {
      console.warn(`[stompClient] error: ${error.code}  ${error.reason}`);

      if (stompClientSubscription) {
        stompClientSubscription.unsubscribe(headers);
      }
      done();
    };

    stompClient.debug = function (str) {
      console.log(`[stompClient] debug: ${str}`);
    };

    // stompClient.connect(headers);// , connectCallback, errorCallback);
    stompClient.connect({}, connectCallback, errorCallback);
  });

  afterEach((done) => {
    if (stompClient.connected) {
      stompClient.disconnect();
    } else {
      // console.log('no connection to break...');
    }
    done();
  });

  testCase('Send-Receive message test', () => {
    it('using topic. receive message from server', (done) => {
      stompServer.on('subscribe', (ev) => {
        console.log(`[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`);
        if (ev.topic === testTopicServerToClient) {
          expect(ev.topic).to.equal(testTopicServerToClient);
          stompServer.send(testTopicServerToClient, {}, testMess);
        }
      });

      stompClientSubscription = stompClient.subscribe(testTopicServerToClient, (message) => {
        console.log(`[stompClient] received: ${message}`);
        message.ack();
        expect(message.body).to.equal(testMess);

        if (stompClientSubscription) {
          stompClientSubscription.unsubscribe({});
        }

        done();
      }, {});
    });

    it('using topic. receive message from client', (done) => {
      const headers = { id: 'sub-0' };
      stompServer.subscribe(testTopicClientToServer, (msg, headers) => {
        const topic = headers.destination;
        console.log(`[stompServer] topic: ${topic} received: ${msg}`);
        expect(topic).to.equal(testTopicClientToServer);
        expect(msg).to.equal(testMess);
        done();
        stompServer.unsubscribe(testTopicClientToServer);

        const subId = headers.subscription;
        assert.isTrue(stompServer.unsubscribe(subId), `unsubscribe successfull, subId: ${subId}`);
      }, headers);

      // stompServer.send(testTopicClientToServer, {}, testMess);
      stompClient.send(testTopicClientToServer, testMess, {});
    });

    it('communicate with individual client', (done) => {
      // 1) add socket param to emit of 'send' event line 112 in stompServer.js
      // 2) add following func to original stompServer.js

      // /** SendIndividual message to specific client
      //  * @param {socket} client
      //  * @param {object} headers Message headers
      //  * @param {string} body Message body */
      // this.sendIndividual = function (socket, topic, headers, body) {
      //   var _headers = {};
      //   if (headers) {
      //     for (var key in headers) {
      //       _headers[key] = headers[key];
      //     }
      //   }
      //   var frame = {
      //     body: body,
      //     headers: _headers
      //   };
      //   var args = {
      //     dest: topic,
      //     frame: this.frameParser(frame)
      //   };
      //
      //   var bodyObj = args.frame.body;
      //   var frame = this.frameSerializer(args.frame);
      //   var headers = { //default headers
      //     'message-id': stomp.genId("msg"),
      //     'content-type': 'text/plain'
      //   };
      //   if (frame.body !== undefined) {
      //     if (typeof frame.body !== 'string')
      //       throw "Message body is not string";
      //     frame.headers["content-length"] = frame.body.length;
      //   }
      //   if (frame.headers) {
      //     for (var key in frame.headers) {
      //       headers[key] = frame.headers[key];
      //     }
      //   }
      //
      //   for (var i in this.subscribes) {
      //     var sub = this.subscribes[i];
      //     if (socket.sessionId !== sub.sessionId) {
      //       continue;
      //     }
      //     var match = this._checkSubMatchDest(sub, args);
      //     if (match) {
      //       args.frame.headers.subscription = sub.id;
      //       frame.command = "MESSAGE";
      //       if (socket !== undefined) {
      //         stomp.StompUtils.sendFrame(socket, frame);
      //       }
      //     }
      //   }
      // };
      //
      // /* ############# END FUNCTIONS ###################### */


      stompClientSubscription = stompClient.subscribe('individual', (message) => {
        console.log(`[stompClient] received: ${message}`);
        message.ack();
        expect(message.body).to.equal(testReplyMess);

        if (stompClientSubscription) {
          stompClientSubscription.unsubscribe({});
        }

        done();
      }, {});

      stompServer.on('send', (ev) => {
        console.log(`[stompServer] Broker send message "${ev.frame.body}" to ${ev.dest}`);

        stompServer.sendIndividual(ev.socket, 'individual', {}, testReplyMess);
      });


      // stompServer.send(testTopicClientToServer, {}, testMess);
      stompClient.send(testTopicClientToServer, testMess, {});
    });

    it('client subscribe once. receive message from client and send reply', (done) => {
      stompServer.on('subscribe', (ev) => {
        console.log(`[stompServer] Client ${ev.sessionId} subscribed to ${ev.topic}`);
        if (ev.topic === testTopicServerToClient) {
          expect(ev.topic).to.equal(testTopicServerToClient);
          stompServer.sendIndividual(ev.socket, testTopicServerToClient, {}, testMess);
        }
      });

      stompClientSubscription = stompClient.subscribe(testTopicServerToClient, (message) => {
        console.log(`[stompClient] received: ${message}`);
        message.ack();
        expect(message.body).to.equal(testMess);

        if (stompClientSubscription) {
          stompClientSubscription.unsubscribe({});
        }

        done();
      }, {});
    });

  });
});

