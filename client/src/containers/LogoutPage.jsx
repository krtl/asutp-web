import React from "react";
import PropTypes from "prop-types";
import Auth from "../modules/Auth";

class LogoutPage extends React.Component {
  constructor(props) {
    super(props);

    Auth.deauthenticateUser();

    this.props.history.push("/");
  }


  render() {
    return null;
  }
}

LogoutPage.contextTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};

export default LogoutPage;
