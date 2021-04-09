import React from "react";
import PropTypes from "prop-types";
import UserActionsForm from "../components/UserActionsForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
import { formatDateTime } from "../modules/formatDateTime";

const MATCHING_ITEM_LIMIT = 2500;

export default class UserActionsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      userActions: []
    };

    this.reloadUserActions = this.reloadUserActions.bind(this);
  }

  reloadUserActions(userName, fromDT, toDT) {
    let params = [];
    if (userName) {
      params.push(`userName=${userName}`);
    }
    // if (action) {
    //   params.push(`action=${action}`);
    // }

    let url = `/api/getUserActions?fromDT=${formatDateTime(
      fromDT
    )}&toDT=${formatDateTime(toDT)}`;

    if (params.length > 0) {
      url += `&${params.join("&")}`;
    }

    const cmds = [
      {
        fetchUrl: url,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: values => {
          this.setState({
            userActions: values.slice(0, MATCHING_ITEM_LIMIT)
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
        <UserActionsForm
          userActions={this.state.userActions}
          onReloadUserActions={this.reloadUserActions}
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

UserActionsPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
