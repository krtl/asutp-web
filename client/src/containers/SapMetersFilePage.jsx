import React from "react";
import PropTypes from "prop-types";
import MySapMetersFileForm from "../components/MySapMetersFileForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";
// import moment from "moment";
import { formatDateTime } from "../modules/formatDateTime";

const MATCHING_VALUES_LIMIT = 10000;

export default class SapMetersFilePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      lastFileName: [],
    };

    this.reloadLastFileName = this.reloadLastFileName.bind(this);
    this.uploadSapMetersFile = this.uploadSapMetersFile.bind(this);

    
  }

  reloadLastFileName() {
    const url = "/prj/GetLastSapMetersFile";

    const uid = MakeUid(5);
    const cmds = [
      {
        fetchUrl: url,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (value) => {
          this.setState({
            lastFileName: value,
          });
        },
      },
    ];

    this.setState({
      cmdUid: uid,
      fetchRequests: cmds,
    });
  }

  uploadSapMetersFile(file) {
    const cmds = [
      {
        fetchUrl: "/api/uploadSapMetersFile",
        fetchMethod: "file",
        fetchData: file,
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

  render() {
    return (
      <div>
        <MySapMetersFileForm
          lastFileName={this.state.lastFileName}
          onReloadLastFileName={this.reloadLastFileName}
          onUploadSapMetersFile={this.uploadSapMetersFile}
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

SapMetersFilePage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired,
  }),
};
