import React from "react";
import PropTypes from "prop-types";
import MyParamHistoryForm from "../components/MyParamHistoryForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
// import moment from "moment";
import { formatDateTime } from "../modules/formatDateTime";

const MATCHING_VALUES_LIMIT = 2500;

export default class ParamHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      paramName: window.location.href.slice(
        window.location.href.lastIndexOf("/") + 1
      ),
      paramValues: []
    };

    this.reloadParamValues = this.reloadParamValues.bind(this);
  }

  reloadParamValues(historyParamName, fromDT, toDT) {
    // const historyParamName = window.location.href.slice(
    //   window.location.href.lastIndexOf("/") + 1
    // );

    // const url = `/api/paramValues?paramName=${historyParamName}&fromDT=${moment(
    //   fromDT
    // ).format("YYYY-MM-DDTHH:mm:ss")}&toDT=${moment(toDT).format(
    //   "YYYY-MM-DDTHH:mm:ss"
    // )}`;

    sessionStorage.setItem('lastHistoryParam', historyParamName);

    const url = `/api/paramValues?paramName=${historyParamName}&fromDT=${formatDateTime(
      fromDT
    )}&toDT=${formatDateTime(toDT)}`;

    const uid = MakeUid(5);
    const cmds = [
      {
        fetchUrl: url,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: values => {
          this.setState({
            paramValues: values.slice(0, MATCHING_VALUES_LIMIT)
          });
        }
      }
    ];

    this.setState({
      cmdUid: uid,
      fetchRequests: cmds,
      paramName: historyParamName
    });
  }

  render() {
    return (
      <div>
        <MyParamHistoryForm
          paramName={this.state.paramName}
          paramValues={this.state.paramValues}
          onReloadParamValues={this.reloadParamValues}
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

ParamHistoryPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
