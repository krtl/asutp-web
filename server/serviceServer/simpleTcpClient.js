// Include Nodejs' net module.
const Net = require("net");
const commandsServer = require("./commandsServer");
const MyAirAlarms = require("./airAlarms");
const myDataModelSchemas = require("../models/myDataModelSchemas");
const config = require("../../config");

// The port number and hostname of the server.
// const port = 12345;
// const host = "localhost";
var client = null;
//const EOF_sign = "<!EOF!>";
const EOF_sign = [3, 7, 10, 15, 250];
var received = [];

const initializeTcpClient = () => {
  client = new Net.Socket();

  commandsServer.initialize(client);

  client.on("connect", function () {
    console.log("Client: connection established with server");

    if (commandsServer.ParamsInitialized()) {
      commandsServer.GetAllParamValues();
      commandsServer.SetActiveAirAlarms(MyAirAlarms.GetActiveAirAlarms());
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

  const IndexOfSubArray = (AList, ASubArray) => {
    let result = -1;
    for (let i = 0; i < AList.length; i++)
    {
        if (AList.length - i >= ASubArray.length)
        {
            let b = true;
            for (let j = 0; j < ASubArray.length; j++)
            {
                if (AList[i + j] != ASubArray[j])
                {
                    b = false;
                    break;
                }
            }
            if (b)
            {
                result = i;
                break;
            }
        }
    }
    return result;
}

  client.on("data", function (chunk) {
    //console.log(`Data received from the server: ${chunk.toString()}.`);
    //var textChunk = chunk.toString('utf8');

    received.push(...chunk);

    if (commandsServer.ParamsInitialized()) {

      let index = IndexOfSubArray(received, EOF_sign);
          if (index > -1)
          {
            do
            {
              let bytechunk = received.slice(0, index);
              received.splice(0, index + EOF_sign.length);
      
              let textChunk = (Buffer.from(bytechunk)).toString();
              if (textChunk != "")
              {
                  //console.debug(`[] received = ${textChunk}`);
      
                  let cmd = null;
                  try {
                    cmd = JSON.parse(textChunk);
                  } catch (err) {
                    console.warn(`Failed to parse element: ${textChunk}. Error= ${err}`);
                  }
                  if (cmd) {
                    const err = commandsServer.processReceivedCommand(cmd);
                    if (err) {
                      console.log(err.message, cmd);
                    }
                  }
              }
      
              index = IndexOfSubArray(received, EOF_sign);

            } while(index > -1)
          }
          else
          {
              if (received.Count > 10000000)
              {
                  // this is the alien client or hanging out client.
                  console.warn(`Socket is disconnected due to the too big size of incoming data.`);
              }
          }
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
    //client.write(data + EOF_sign);
    client.write(Buffer.from(data, 'utf8'));
    client.write(Buffer.from(EOF_sign));
  }
};

module.exports.initializeTcpClient = initializeTcpClient;
module.exports.finalizeTcpClient = finalizeTcpClient;
module.exports.Send = Send;
