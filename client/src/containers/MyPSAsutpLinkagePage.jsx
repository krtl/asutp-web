import React from "react";
import PropTypes from "prop-types";
import MyPSAsutpLinkageForm from "../components/MyPSAsutpLinkageForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";

export default class PSAsutpLinkagePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      psName: "",
      PS: null,
      asutpConnections: []
    };

    this.reloadPS = this.reloadPS.bind(this);
    this.savePSLinkage = this.savePSLinkage.bind(this);
    this.reloadAsutpConnections = this.reloadAsutpConnections.bind(this);
  }

  reloadPS(psName) {
    if (psName === "") {
      psName = window.location.href.slice(
        window.location.href.lastIndexOf("/") + 1
      );
    }

    const cmds = [
      {
        fetchUrl: `/prj/getJsonPS?name=${psName}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: value => {
          this.setState({
            PS: value
          });
          if (value) this.reloadAsutpConnections(value.sapCode);
        }
      }
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds,
      psName: psName
    });
  }

  savePSLinkage(psName, linkage) {
    const cmds = [
      {
        fetchUrl: `/api/savePSLinkage?name=${psName}`,
        fetchMethod: "post",
        fetchData: linkage,
        fetchCallback: () => {
          // this.setState({
          // });
        }
      }
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds
    });
  }

  reloadAsutpConnections(psSapCode) {
    const cmds = [
      {
        fetchUrl: `/prj/getAsutpConnectionsFor?psSapCode=${psSapCode}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: connections => {
          connections.sort((con1, con2) => {
            if (con1.name > con2.name) {
              return 1;
            }
            if (con1.name < con2.name) {
              return -1;
            }
            return 0;
          });

          this.setState({
            asutpConnections: connections
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
        <MyPSAsutpLinkageForm
          psName={this.state.psName}
          PS={this.state.PS}
          asutpConnections={this.state.asutpConnections}
          onReloadPS={this.reloadPS}
          onSavePSLinkage={this.savePSLinkage}
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

PSAsutpLinkagePage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
