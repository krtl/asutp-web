import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "material-ui/Tabs";
import MyPSs from "./MyPSs";
import MyNodeStateHistory from "../containers/MyNodeStateHistory";
import MyRegionSchemaContainer from "../containers/MyRegionSchemaContainer";

class MainForm extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    console.log("MainForm did mount");
  }

  render() {
    return (
      <Tabs>
        <Tab label="Schema">
          <div className="container">
            <MyRegionSchemaContainer
              schemas={this.props.schemas}
              history={this.props.history}
            />
          </div>
        </Tab>
        <Tab label="PSs">
          <MyPSs
            schemas={this.props.schemas}
            PSs={this.props.PSs}
            onLoadPSs={this.props.onLoadPSs}
          />
        </Tab>
        <Tab label="Shutdowns">
          <MyNodeStateHistory />
        </Tab>
      </Tabs>
    );
  }
}

MainForm.propTypes = {
  schemas: PropTypes.array.isRequired,
  PSs: PropTypes.array.isRequired,
  ps: PropTypes.string.isRequired,
  onLoadParams: PropTypes.func.isRequired,
  onLoadPSs: PropTypes.func.isRequired,
  onLoadPS: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

export default MainForm;
