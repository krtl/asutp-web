import React from "react";
import PropTypes from "prop-types";
import MyNodeStateHistoryForm from "../components/MyNodeStateHistoryForm";
import MyFetchClient from "./MyFetchClient";
import makeUid from "../modules/MyFuncs";

const MATCHING_ITEM_LIMIT = 2500;

export default class NodeStateHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      nodeName: "",
      stateValues: []
    };

    this.reloadStateHistory = this.reloadStateHistory.bind(this);
  }

  reloadStateHistory(nodeName) {
    this.setState({ nodeName });

    const cmds = [
      {
        fetchUrl: `/api/nodeStateValues?nodeName=${nodeName}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: values => {
          this.setState({
            stateValues: values.slice(0, MATCHING_ITEM_LIMIT)
          });
        }
      }
    ];

    this.setState({
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  render() {
    return (
      <div>
        <MyNodeStateHistoryForm
          nodeName={this.state.nodeName}
          stateValues={this.state.stateValues}
          reloadStateHistory={this.reloadStateHistory}
          history={this.props.history}
        />
        <MyFetchClient
          cmdUid={this.state.cmdUid}
          fetchRequests={this.state.fetchRequests}
          history={this.props.history}
        />
      </div>
    );
  }
}

NodeStateHistoryPage.propTypes = {
  history: PropTypes.object.isRequired
};
