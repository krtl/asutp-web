const querystring = require('querystring');
const http = require('http');
const KeepAliveAgent = require('./httpAgent.js');

//const billingHost = '127.0.0.1';
const billingHost = 'srv-android';


const agent = new KeepAliveAgent({ maxSockets: 500 }); // Optionally define more parallel sockets


function loadAccountInfo(sessionId) {
  const options = {
    agent,
    hostname: billingHost,
    port: '9000',
    path: '/userabons',
    headers: {
      Cookie: sessionId,
    },
  };


  for (let i = 0; i < 300; i++) {
    const getReq = http.request(options, (res) => {
      let str = '';
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      res.on('connect', () => {
        console.log('connected');
      });

      res.on('data', (chunk) => {
        str += chunk;
      });

      res.on('end', () => {
        console.log(str);
      });
    });

    getReq.end();
  }
}

function PostCode() {
  const postData = querystring.stringify({
    email: 'itps02@soe.com.ua',
    password: 'Rabusta1',
    Submit: 'Login',
  });


  const postOptions = {
    agent,
    hostname: billingHost,
    port: '9000',
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const postReq = http.request(postOptions, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });
    res.on('end', () => {
      console.log('end');


      const arr = res.headers['set-cookie'];
      if (arr.length > 0) {
        const arr1 = arr[0].split(';');
        if (arr1.length > 0) {
          loadAccountInfo(arr1[0]);
        }
      }
    });
  });


  postReq.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  postReq.write(postData);
  postReq.end();
}

PostCode('');
