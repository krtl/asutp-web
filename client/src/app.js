import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Base from "./components/Base.jsx";
// import HomePage from "./components/HomePage.jsx";
import MainPage from "./containers/MainPage.jsx";
import ParamHistoryPage from "./containers/ParamHistoryPage.jsx";
import SoeConsumptionHistoryPage from "./containers/SoeConsumptionHistoryPage.jsx";
import SapMetersFilePage from "./containers/SapMetersFilePage.jsx";
import AsutpUsersReportPage from "./containers/AsutpUsersReportPage.jsx";
import PSSchemePage from "./containers/MyPSSchemePage.jsx";
import PSAsutpLinkagePage from "./containers/MyPSAsutpLinkagePage.jsx";
import NodeStateHistoryPage from "./containers/MyNodeStateHistoryPage.jsx";
import SystemServicePage from "./containers/SystemServicePage.jsx";
import AsutpCommunicationModelPage from "./containers/AsutpCommunicationModelPage.jsx";
import AirAlarmPage from "./containers/AirAlarmPage.jsx";
import UserActionsPage from "./containers/UserActionsPage.jsx";
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
          Auth.canSeeReports() ? (
            <Base>{AddExtraProps(children, routeProps)}</Base>
          ) : (
            ((location.pathname === "/") || (location.pathname === "/airAlarm") || (location.pathname === "/soeConsumption"))? (
              <Base>{AddExtraProps(children, routeProps)}</Base>
            ) : (
              <Redirect
              to={{
                pathname: "/",
                state: { from: location },
              }}
              />
            )  
          )
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
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
        
        <PrivateRoute path="/soeConsumption">
          <SoeConsumptionHistoryPage />
        </PrivateRoute>
        
        <PrivateRoute path="/sapMeters">
          <SapMetersFilePage />
        </PrivateRoute>

        <PrivateRoute path="/AsutpUsersReport">
          <AsutpUsersReportPage />
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

        <PrivateRoute path="/systemService">
          <SystemServicePage />
        </PrivateRoute>

        <PrivateRoute path="/asutpCommunicationModel">
          <AsutpCommunicationModelPage />
        </PrivateRoute>

        <PrivateRoute path="/airAlarm">
          <AirAlarmPage />
        </PrivateRoute>

        <PrivateRoute path="/userActions">
          <UserActionsPage />
        </PrivateRoute>

        <Route path="/login" render={(props) => <LoginPage {...props} />} />
        <Route path="/signup" render={(props) => <SignUpPage {...props} />} />
        <Route path="/logout" render={(props) => <LogoutPage {...props} />} />

        <PrivateRoute path="/">
          <MainPage />
        </PrivateRoute>
      </Switch>
    </div>
  );
}
