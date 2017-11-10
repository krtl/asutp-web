import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { syncHistoryWithStore } from 'react-router-redux';

import { loadState } from './modules/localStorage';

import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Router, hashHistory } from 'react-router';
// import { browserHistory, Router } from 'react-router';
import routes from './routes';
import reducer from './reducers';


// remove tap delay, essential for MaterialUI to work properly
injectTapEventPlugin();


const persistedState = loadState();
const store = createStore(
  reducer,
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

const history = syncHistoryWithStore(hashHistory, store);

ReactDom.render((
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme()} >
      <Router
        history={history} routes={routes}
      />
    </MuiThemeProvider>
  </Provider>),
document.getElementById('root'),
);
