import React from "react";
import PropTypes from "prop-types";
import MyNodeStateHistoryForm from "../components/MyNodeStateHistoryForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
import { formatDateTime } from "../modules/formatDateTime";

const MATCHING_ITEM_LIMIT = 2500;

export default class NodeStateHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      nodeName: this.props.history.location.pathname.replace(
        "/nodeStateHistory/",
        ""
      ),
      stateValues: []
    };

    this.reloadStateHistory = this.reloadStateHistory.bind(this);
  }

  reloadStateHistory(nodeName, fromDT, toDT, poweredNotSwitchedOn) {
    this.setState({ nodeName });

    let urlFunc = poweredNotSwitchedOn
      ? "nodePoweredStateValues?nodeName="
      : "nodeSwitchedOnStateValues?connectorName=";

    const cmds = [
      {
        fetchUrl: `/api/${urlFunc}${nodeName}&fromDT=${formatDateTime(
          fromDT
        )}&toDT=${formatDateTime(toDT)}`,
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
      cmdUid: MakeUid(5),
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
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
