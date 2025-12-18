import React from "react";
import PropTypes from "prop-types";
import PowerLoadsHistoryForm from "../components/PowerLoadsHistoryForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
// import moment from "moment";
import { formatDateTime } from "../modules/formatDateTime";

const MATCHING_VALUES_LIMIT = 10000;

export default class PowerLoadsHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      asutpReses: [],
      paramValues: [],
    };

    this.reloadReses = this.reloadReses.bind(this);
    this.reloadParamValues = this.reloadParamValues.bind(this);
  }

  reloadReses() {

    this.setState({
      asutpReses: [],
      paramValues: [],
    });

    const url = '/api/GetAsutpResForPowerConsumption';

    const uid = MakeUid(5);
    const cmds = [
      {
        fetchUrl: url,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (values) => {
          this.setState({
            asutpReses: values.slice(0, MATCHING_VALUES_LIMIT),
          });
        },
      },
    ];

    this.setState({
      cmdUid: uid,
      fetchRequests: cmds,
    });
  }

  reloadParamValues(historyParamName, fromDT, toDT) {
    const url = `/api/paramValues?paramName=${historyParamName}&fromDT=${formatDateTime(fromDT)}&toDT=${formatDateTime(toDT)}`;

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
        <PowerLoadsHistoryForm
          asutpReses={this.state.asutpReses}
          paramValues={this.state.paramValues}
          onReloadReses={this.reloadReses}
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

PowerLoadsHistoryPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired,
  }),
};
