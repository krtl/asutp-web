import React from "react";
import MyParamHistoryForm from "../components/MyParamHistoryForm";
import MyFetchClient from "./MyFetchClient";
import makeUid from "../modules/MyFuncs";

const MATCHING_VALUES_LIMIT = 2500;

export default class ParamHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      paramName: "",
      paramValues: []
    };

    this.reloadParamValues = this.reloadParamValues.bind(this);
  }

  reloadParamValues(paramName, useHalfHourValues) {
    const historyParamName = window.location.href.slice(
      window.location.href.lastIndexOf("/") + 1
    );

    let url = "";
    if (useHalfHourValues) {
      url = `/api/paramHalfHourValues?paramName=${historyParamName}`;
    } else {
      url = `/api/paramValues?paramName=${historyParamName}`;
    }

    const uid = makeUid(5);
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
        />
      </div>
    );
  }
}

ParamHistoryPage.propTypes = {};
