import React from "react";
import PropTypes from "prop-types";
import MySoeConsumptionHistoryForm from "../components/MySoeConsumptionHistoryForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
// import moment from "moment";
import { formatDateTime } from "../modules/formatDateTime";

const MATCHING_VALUES_LIMIT = 10000;

export default class SoeConsumptionHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      paramValues: [],
    };

    this.reloadParamValues = this.reloadParamValues.bind(this);
  }

  reloadParamValues(fromDT, toDT) {
    const url = `/prj/soeConsumptionHistory?fromDT=${formatDateTime(
      fromDT
    )}&toDT=${formatDateTime(toDT)}`;

    const uid = MakeUid(5);
    const cmds = [
      {
        fetchUrl: url,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (values) => {
          this.setState({
            paramValues: values.slice(0, MATCHING_VALUES_LIMIT),
          });
        },
      },
    ];

    this.setState({
      cmdUid: uid,
      fetchRequests: cmds,
    });
  }

  render() {
    return (
      <div>
        <MySoeConsumptionHistoryForm
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

SoeConsumptionHistoryPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired,
  }),
};
