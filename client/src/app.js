import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Base from "./components/Base.jsx";
// import HomePage from "./components/HomePage.jsx";
import MainPage from "./containers/MainPage.jsx";
import ParamHistoryPage from "./containers/ParamHistoryPage.jsx";
import SoeConsumptionHistoryPage from "./containers/SoeConsumptionHistoryPage.jsx";
import PowerLoadsHistoryPage from "./containers/PowerLoadsHistoryPage.jsx";
import SignalsPage from "./containers/SignalsPage.jsx";
import PowerLoadsHistoryPage from "./containers/PowerLoadsHistoryPage.jsx";
import SignalsPage from "./containers/SignalsPage.jsx";
import SapMetersFilePage from "./containers/SapMetersFilePage.jsx";
import AsutpUsersReportPage from "./containers/AsutpUsersReportPage.jsx";
import SystemServicePage from "./containers/SystemServicePage.jsx";
import AsutpCommunicationModelPage from "./containers/AsutpCommunicationModelPage.jsx";
import AirAlarmPage from "./containers/AirAlarmPage.jsx";
import LoginPage from "./containers/LoginPage.jsx";
import SignUpPage from "./containers/SignUpPage.jsx";
import LogoutPage from "./containers/LogoutPage.jsx";
import Auth from "./modules/Auth";
import Snowfall from 'react-snowfall'

function AddExtraProps(Component, extraProps) {
  // eslint-disable-next-line
  return <Component.type {...Component.props} {...extraProps} />;
}

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location, ...routeProps }) =>
        Auth.isUserAuthenticated() ? (
          (Auth.canSeeReports() || Auth.canLoadSapMeters()) ? (
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
      <div>
    <Snowfall />
  </div>
    <div>
      <Switch>
        <PrivateRoute path="/paramHistory/:ParamName">
          <ParamHistoryPage />
        </PrivateRoute>
        
        <PrivateRoute path="/soeConsumption">
          <SoeConsumptionHistoryPage />
        </PrivateRoute>

        <PrivateRoute path="/powerLoads">
          <PowerLoadsHistoryPage />
        </PrivateRoute>  

        <PrivateRoute path="/signals">
          <SignalsPage />
        </PrivateRoute>                
        
        <PrivateRoute path="/sapMeters">
          <SapMetersFilePage />
        </PrivateRoute>

        <PrivateRoute path="/AsutpUsersReport">
          <AsutpUsersReportPage />
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

        <Route path="/login" render={(props) => <LoginPage {...props} />} />
        <Route path="/signup" render={(props) => <SignUpPage {...props} />} />
        <Route path="/logout" render={(props) => <LogoutPage {...props} />} />

        <PrivateRoute path="/">
          <MainPage />
        </PrivateRoute>
      </Switch>
    </div>
      </div>
  );
}
