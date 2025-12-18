import React from "react";
import PropTypes from "prop-types";
import MySapMetersFileForm from "../components/MySapMetersFileForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";


export default class SapMetersFilePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      lastFileName: "",
      uploadResult: "",
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
            uploadResult: "",
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
        fetchObject: file,
        fetchCallback: (value) => {
          this.setState({
            uploadResult: value,
          });
          if (value === "File successfully uploaded!") {
            this.reloadLastFileName();
          }
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
          uploadResult={this.state.uploadResult}
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
