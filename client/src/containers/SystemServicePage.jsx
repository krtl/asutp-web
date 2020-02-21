import React from "react";
import PropTypes from "prop-types";
import SystemServiceForm from "../components/SystemServiceForm";
import MyFetchClient from "./MyFetchClient";
import {MakeUid} from "../modules/MyFuncs";

const MATCHING_ITEM_LIMIT = 2500;

export default class SystemServicePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      // abort: false,
      collisions: [],
      blockedParams: [],
      asutpConnections: []
    };

    this.reloadCollisions = this.reloadCollisions.bind(this);
    this.reloadBlockedParams = this.reloadBlockedParams.bind(this);
    this.reloadAsutpConnections = this.reloadAsutpConnections.bind(this);
  }

  reloadCollisions() {
    const cmds = [
      {
        fetchUrl: "/api/getCollisions",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: values => {
          this.setState({
            collisions: values.slice(0, MATCHING_ITEM_LIMIT)
          });
        }
      }
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds
    });
  }

  reloadBlockedParams() {
    const cmds = [
      {
        fetchUrl: "/api/getBlockedParams",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: values => {
          this.setState({
            blockedParams: values.slice(0, MATCHING_ITEM_LIMIT)
          });
        }
      }
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds
    });
  }

  reloadAsutpConnections() {
    const cmds = [
      {
        fetchUrl: "/api/getAsutpConnections",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: values => {
          this.setState({
            asutpConnections: values.slice(0, MATCHING_ITEM_LIMIT)
          });
        }
      }
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds
    });
  }

  componentWillUnmount() {
    // calcel all pending requests
    // this.setState({
    //   abort: true
    // });
  }

  render() {
    return (
      <div>
        <SystemServiceForm
          collisions={this.state.collisions}
          blockedParams={this.state.blockedParams}
          asutpConnections={this.state.asutpConnections}
          onReloadCollisions={this.reloadCollisions}
          onReloadBlockedParams={this.reloadBlockedParams}
          onReloadAsutpConnections={this.reloadAsutpConnections}
          history={this.props.history}
        />
        <MyFetchClient
          cmdUid={this.state.cmdUid}
          fetchRequests={this.state.fetchRequests}
          // abort={this.state.abort}
          history={this.props.history}
        />
      </div>
    );
  }
}

SystemServicePage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
