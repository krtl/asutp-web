import React from "react";
import ReactDom from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { loadState } from "./modules/localStorage";

// import getMuiTheme from "material-ui/styles/getMuiTheme";
// import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { BrowserRouter as Router } from "react-router-dom";
import reducer from "./reducers";
import App from "./app";

const persistedState = loadState();
const store = createStore(
  reducer,
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDom.render(
  <Provider store={store}>
    {/* <MuiThemeProvider muiTheme={getMuiTheme()}> */}
    <Router>
      <App />
    </Router>
    {/* </MuiThemeProvider> */}
  </Provider>,
  document.getElementById("root")
);
