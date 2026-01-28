import React from "react";
// import ReactDom from "react-dom";
import { createRoot } from 'react-dom/client';
// import { StyledEngineProvider } from '@mui/material/styles';
// import { createStore } from "redux";
import { Provider } from "react-redux";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// import { loadState } from "./modules/localStorage";

// //  import getMuiTheme from "material-ui/styles/getMuiTheme";
// //  import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
 
import { BrowserRouter as Router } from "react-router-dom";
// import reducer from "./reducers";
import App from "./app";

// import { configureStore } from '@reduxjs/toolkit';
// import rootReducer from './reducers';

import store from "./store";


// import { StyledEngineProvider } from '@mui/material/styles';


// const persistedState = loadState();
// const store = createStore(
//   reducer,
//   persistedState,
//   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
// );

// ReactDom.render(
//   <Provider store={store}>
//     {/* <MuiThemeProvider muiTheme={getMuiTheme()}> */}
//      <StyledEngineProvider injectFirst>
//     <Router>
//       <App />
//     </Router>
//     {/* </MuiThemeProvider> */}
//    </StyledEngineProvider>
//   </Provider>,
//   document.getElementById("root")
// );



// const container = document.getElementById('root');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<App />);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
//  import { StyledEngineProvider } from '@mui/material/styles';
// import App from './app';
// import { BrowserRouter as Router } from "react-router-dom";


const darkTheme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

createRoot(document.getElementById('root')).render(
   <React.StrictMode>
    {/* MUI styles will be injected first in the <head> */}
    {/* <StyledEngineProvider injectFirst> */}
        <ThemeProvider theme={darkTheme} >
      <CssBaseline />

   <Provider store={store}>
     <Router>
       <App />
     </Router>
   </Provider>
   </ThemeProvider>
  {/* </StyledEngineProvider> */}
  </React.StrictMode>
);

