const querystring = require('querystring');
const http = require('http');
const KeepAliveAgent = require('./httpAgent.js');

//const billingHost = '127.0.0.1';
const billingHost = 'srv-android';

//const billingHost = 'billing.soe.com.ua';
const billingPath = '';
//const billingPath = '/billing_android_entry_point';

const agent = new KeepAliveAgent({ maxSockets: 55 }); // Optionally define more parallel sockets


function loadAccountInfo(sessionId) {
  const locPath = billingPath + '/userabons';

  const options = {
    agent,
    hostname: billingHost,
    port: '9000',
    path: locPath,
    headers: {
      Cookie: sessionId,
    },
  };


  for (let i = 0; i < 1000; i++) {
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

  const loginPath = billingPath + '/login';

  const postOptions = {
    agent,
//    protocol: 'https',
    hostname: billingHost,
    //host: '127.0.0.1',
    port: '9000',
    path: loginPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'Connection': 'keep-alive',
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

  // post the data
  postReq.write(postData);
  postReq.end();
}

PostCode('');
