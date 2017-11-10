/* eslint-disable no-undef */
import Auth from './Auth';

const myHeaders = new Headers({
//  "Content-Length": content.length.toString(),
//  'Content-type': 'application/x-www-form-urlencoded',
  'Content-type': 'application/json;charset=UTF-8',
  Authorization: `bearer ${Auth.getToken()}`,
});

const myGetInit = { method: 'GET',
  headers: myHeaders,
};

const myPostInit = { method: 'POST',
  headers: myHeaders,
};

function loadNodes(prjName, cb) {
  return fetch(new Request(`api/nodes?proj=${prjName}`, myGetInit), {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function saveNodes(s, cb) {
  fetch(new Request('api/save_node', myPostInit),
    {
      body: s,
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(response) {
  return response.json();
}

const Client = { loadNodes, saveNodes };
export default Client;
