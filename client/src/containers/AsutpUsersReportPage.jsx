import React from "react";
import PropTypes from "prop-types";
import AsutpUsersReportForm from "../components/AsutpUsersReportForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
// import moment from "moment";

const MATCHING_VALUES_LIMIT = 10000;

export default class SoeConsumptionHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      users: [],
    };

    this.reloadUsersReport = this.reloadUsersReport.bind(this);
  }

  reloadUsersReport() {
    const url = `/getAsutpUsersReport`;

    const uid = MakeUid(5);
    const cmds = [
      {
        fetchUrl: url,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (values) => {
          values.sort((r1, r2) => {
            if (r1.Login > r2.Login) {
              return 1;
            }
            if (r1.Login < r2.Login) {
              return -1;
            }
            return 0;
          });

          this.setState({
            users: values.slice(0, MATCHING_VALUES_LIMIT),
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
        <AsutpUsersReportForm
          users={this.state.users}
          onReloadUsersReport={this.reloadUsersReport}
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
