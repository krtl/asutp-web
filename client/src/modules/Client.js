/* eslint-disable no-undef */
import Auth from './Auth';

let myHeaders = null;
let myGetInit = null;
let myPostInit = null;

function recreateHeader() {
  myHeaders = new Headers({
//  "Content-Length": content.length.toString(),
//  'Content-type': 'application/x-www-form-urlencoded',
    'Content-type': 'application/json;charset=UTF-8',
    'Authorization': `bearer ${Auth.getToken()}`,
  });

  myGetInit = { method: 'GET',
    headers: myHeaders,
  };

  myPostInit = { method: 'POST',
    headers: myHeaders,
  };
}

function loadNodes(prjName, cb) {
  if (!myHeaders) { recreateHeader(); }
  return fetch(new Request(`api/nodes?proj=${prjName}`, myGetInit), {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function loadWires(prjName, cb) {
  if (!myHeaders) { recreateHeader(); }
  return fetch(new Request(`api/wires?proj=${prjName}`, myGetInit), {
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

function loadParamLists(userName, cb) {
  if (!myHeaders) { recreateHeader(); }
  return fetch(new Request(`api/paramLists?user=${userName}`, myGetInit), {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function loadParams(paramListName, cb) {
  return fetch(new Request(`api/params?prmLstName=${paramListName}`, myGetInit), {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function loadParamValues(paramName, useHalfHourValues, cb) {
  if (!myHeaders) { recreateHeader(); }
  let uri = '';
  if (useHalfHourValues){
    uri=`api/paramHalfHourValues?paramName=${paramName}`;
  }
  else {
    uri=`api/paramValues?paramName=${paramName}`;
  }
  return fetch(new Request(uri, myGetInit), {
    accept: 'application/json',
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

const Client = { loadNodes, loadWires, saveNodes, loadParams, loadParamLists, loadParamValues, resetHeader: recreateHeader };
export default Client;
