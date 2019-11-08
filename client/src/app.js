import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Base from "./components/Base.jsx";
// import HomePage from "./components/HomePage.jsx";
import MainPage from "./containers/MainPage.jsx";
import ParamHistoryPage from "./containers/ParamHistoryPage.jsx";
import PSSchemePage from "./containers/MyPSSchemePage.jsx";
import PSAsutpLinkagePage from "./containers/MyPSAsutpLinkagePage.jsx";
import  NodeStateHistoryPage from "./containers/MyNodeStateHistoryPage";
import LoginPage from "./containers/LoginPage.jsx";
import SignUpPage from "./containers/SignUpPage.jsx";
import LogoutPage from "./containers/LogoutPage.jsx";
import Auth from "./modules/Auth";

function AddExtraProps(Component, extraProps) {
  return <Component.type {...Component.props} {...extraProps} />;
}

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location, ...routeProps }) =>
        Auth.isUserAuthenticated() ? (
          <Base>{AddExtraProps(children, routeProps)}</Base>
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default function App() {
  return (
    <div>
      <Switch>
        <PrivateRoute path="/paramHistory/:paramName">
          <ParamHistoryPage />
        </PrivateRoute>

        <PrivateRoute path="/psScheme/:psName">
          <PSSchemePage />
        </PrivateRoute>

        <PrivateRoute path="/psAsutpLinkage/:psName">
          <PSAsutpLinkagePage />
        </PrivateRoute>

        <PrivateRoute path="/nodeStateHistory/:nodeName">
          <NodeStateHistoryPage />
        </PrivateRoute>        

        <Route path="/login" render={props => <LoginPage {...props} />} />
        <Route path="/signup" render={props => <SignUpPage {...props} />} />
        <Route path="/logout" render={props => <LogoutPage {...props} />} />

        <PrivateRoute path="/">
          <MainPage />
        </PrivateRoute>
      </Switch>
    </div>
  );
}
