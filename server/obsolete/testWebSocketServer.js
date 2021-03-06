const chai = require("chai");

const expect = chai.expect;
const WebSocket = require("ws");
const WebSocketServer = require("../serviceBackground/webSocketServer");

describe("WebSocketServer", () => {
  let wss;
  let wsc;

  before(() => {
    wss = new WebSocket.Server({ port: 3333 });
    WebSocketServer.initializeWebSocketServer(wss);
  });

  after(() => {
    WebSocketServer.finalizeWebSocketServer();
    wss.close();
  });

  beforeEach(done => {
    wsc = new WebSocket("ws://localhost:3333");
    wsc.on("open", () => {
      console.info("opened...");
      done();
    });
    wsc.on("error", err => {
      console.warn(`error: ${err.message}`);
      done();
    });
    wsc.on("close", () => {
      console.info("closed...");
    });
  });

  afterEach(done => {
    if (wsc.readyState === WebSocket.OPEN) {
      // console.info('disconnecting...');
      wsc.close();
    } else {
      console.info("no connection to break...");
    }
    done();
  });

  describe("First (hopefully useful) test", () => {
    it("Doing some things with indexOf()", done => {
      expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
      expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
      done();
    });

    it("should return echo", done => {
      const mess = "I need an echo!";
      wsc.on("message", message => {
        expect(message).to.equal(mess);
        done();
      });

      wsc.send(`echo: ${mess}`);
    });
  });
});
