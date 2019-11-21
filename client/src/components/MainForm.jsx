import React from "react";
import PropTypes from "prop-types";
import SchemaManagerContainer from "../containers/SchemaManagerContainer";

class MainForm extends React.Component {
  componentDidMount() {
    // console.log("MainForm did mount");
  }

  render() {
    return <SchemaManagerContainer history={this.props.history} />;
  }
}

MainForm.propTypes = {
  history: PropTypes.object.isRequired
};

export default MainForm;
