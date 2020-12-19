// Include Nodejs' net module.
const Net = require("net");
const commandsServer = require("./commandsServer");
const myDataModelSchemas = require("../models/myDataModelSchemas");
const config = require("../../config");

// The port number and hostname of the server.
// const port = 12345;
// const host = "localhost";
var client = null;
const EOF_sign = "<!EOF!>";
var received = "";

const initializeTcpClient = () => {
  client = new Net.Socket();

  commandsServer.initialize(client);

  client.on("connect", function () {
    console.log("Client: connection established with server");

    if (myDataModelSchemas.IsInitialized) {
      commandsServer.GetAllParamValues();
    }

    // console.log("---------client details -----------------");
    // var address = client.address();
    // var port = address.port;
    // var family = address.family;
    // var ipaddr = address.address;
    // console.log("Client is listening at port" + port);
    // console.log("Client ip:" + ipaddr);
    // console.log("Client is IP4/IP6: " + family);

    // writing data to server
    //client.write("hello from client" + EOF_sign);
    // commandsServer.GetCollisions();

    // commandsServer.SetManualValue({
    //   nodeName: "testNode",
    //   cmd: "testCmd",
    //   manualValue: 12,
    //   userId: "zzz1",
    // });
  });

  client.on("data", function (chunk) {
    console.log(`Data received from the server: ${chunk.toString()}.`);

    received = received + chunk.toString();

    let readyToProcess = received;
    x = readyToProcess.indexOf(EOF_sign);
    if (x > -1) {
      if (!readyToProcess.endsWith(EOF_sign)) {
        readyToProcess = received.substr(0, x);
        received = received.substr(x, received.length);
      }

      const arr = received.split(EOF_sign);
      arr.forEach((element) => {
        if (element !== "") {
          let cmd = null;
          try {
            cmd = JSON.parse(element);
          } catch (err) {
            console.log(`Failed to parse element: ${element}. Error= ${err}`);
          }
          if (cmd) {
            const err = commandsServer.processReceivedCommand(cmd);
            if (err) {
              console.log(err.message, cmd);
            }
          }
        }
      });
    }
  });

  client.on("end", function () {
    console.log("Requested an end to the TCP connection");
  });

  client.on("error", function (error) {
    console.log("SocketError: " + error);
  });

  client.on("close", function () {
    console.log("SocketClosed.. Reconnecting after 10 sec");
    setTimeout(connect, 10000);
  });

  connect();
};

const finalizeTcpClient = () => {
  if (client) {
    client.end();
  }
};

const connect = () => {
  if (client) {
    client.connect({
      port: config.recalculationServerPort,
      host: config.recalculationServerHost,
    });
  }
};

const Send = (data) => {
  if (client) {
    client.write(data + EOF_sign);
  }
};

module.exports.initializeTcpClient = initializeTcpClient;
module.exports.finalizeTcpClient = finalizeTcpClient;
module.exports.Send = Send;
