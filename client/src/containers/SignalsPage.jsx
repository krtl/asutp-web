import React from "react";
import PropTypes from "prop-types";
import SignalsForm from "../components/SignalsForm";
import MyFetchClient from "./MyFetchClient";
import { MakeUid } from "../modules/MyFuncs";

import Auth from "../modules/Auth";
const moment = require("moment");

const MATCHING_VALUES_LIMIT = 10000;

export default class SapMetersFilePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      asutpReses: [],
      uploadResult: "",
    };

    this.reloadReses = this.reloadReses.bind(this);
    this.uploadSignalsFile = this.uploadSignalsFile.bind(this);

  }

  reloadReses() {
    this.setState({
      asutpReses: [],
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

  dowloadSignalReport(PsGuid, includeTS, includeTV, includeTU, forScadaSkat) {
    const options = {
      headers: {
        Authorization: `bearer ${Auth.getToken()}`
      }
    };
     fetch(`/prj/GetAsutpSignalsExcelReport?PsGuid=${PsGuid}&TS=${includeTS}&TV=${includeTV}&TU=${includeTU}&ForScadaSkat=${forScadaSkat}`, options)
      .then(response => response.blob())
      .then(blob => {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = `AsutpSignalRep${moment().format("YYYY-MM-DD_HH_mm_ss")}.xlsx`;
          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();    
          a.remove();  //afterwards we remove the element again         
      });
  }
  
  uploadSignalsFile(file) {
      const cmds = [
        {
          fetchUrl: "/api/uploadSignalsFile",
          fetchMethod: "file",
          fetchObject: file,
          fetchCallback: (value) => {
            this.setState({
              uploadResult: value,
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
        <SignalsForm
          asutpReses={this.state.asutpReses}
          onReloadReses={this.reloadReses}
          onDowloadSignalReport={this.dowloadSignalReport}
          onUploadSignalsFile={this.uploadSignalsFile}
          uploadResult={this.state.uploadResult}
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
