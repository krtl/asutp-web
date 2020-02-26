import React from "react";
import PropTypes from "prop-types";
import MyParamHistoryForm from "../components/MyParamHistoryForm";
import MyFetchClient from "./MyFetchClient";
import {MakeUid} from "../modules/MyFuncs";

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

  reloadParamValues(paramName) {
    const historyParamName = window.location.href.slice(
      window.location.href.lastIndexOf("/") + 1
    );

    const url = `/api/paramValues?paramName=${historyParamName}`;

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
