import React from "react";
import PropTypes from "prop-types";
import MyRegionSchemaContainer from "../containers/MyRegionSchemaContainer";

class MainForm extends React.Component {
  componentDidMount() {
    // console.log("MainForm did mount");
  }

  render() {
    return (
      <MyRegionSchemaContainer
        schemas={this.props.schemas}
        history={this.props.history}
      />
    );
  }
}

MainForm.propTypes = {
  schemas: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
};

export default MainForm;
