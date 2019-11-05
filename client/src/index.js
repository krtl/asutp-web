import React from "react";
import ReactDom from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
// import { syncHistoryWithStore } from "react-router-redux";
// import createHistory from "history/createBrowserHistory";
// import history from "./history";

import { loadState } from "./modules/localStorage";

import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { BrowserRouter as Router } from "react-router-dom";
// import routes from "./routes";
import reducer from "./reducers";
import App from "./app";

const persistedState = loadState();
const store = createStore(
  reducer,
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// const history1 = syncHistoryWithStore(history, store);

// const history = createHistory();

ReactDom.render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Router>
        <App />
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById("root")
);
