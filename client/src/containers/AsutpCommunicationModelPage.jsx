import React from "react";
import PropTypes from "prop-types";
import AsutpCommunicationModelForm from "../components/AsutpCommunicationModelForm";
import MyFetchClient from "./MyFetchClient";
import MyStompClient from "../modules/MyStompClient";
import { MakeUid } from "../modules/MyFuncs";

const ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME = "ASUTP_COMMUNICATION_MODEL";
const MATCHING_ITEM_LIMIT = 2500;

let valuesUpdated = 0;
let timerId;

export default class AsutpCommunicationModelPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      // abort: false,
      asutpCommunicationReses: [],
      paramValues: [],
      update: false,
      lastHistoryParam: sessionStorage.getItem('lastHistoryParam'),
    };

    this.reloadAsutpComminicationModel = this.reloadAsutpComminicationModel.bind(
      this
    );
  }

  reloadAsutpComminicationModel() {
    this.setState({
      asutpCommunicationReses: [],
      paramValues: [],
    });

    const cmds = [
      {
        fetchUrl: "/getAsutpComminicationModel",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (values) => {
          this.setState({
            asutpCommunicationReses: values.slice(0, MATCHING_ITEM_LIMIT),
          });

          MyStompClient.subscribeToValues(
            ASUTP_COMMUNICATION_MODEL_SCHEMA_NAME,
            (value) => {
              let b = false;

              //console.log(value);

              if ("paramName" in value) {
                for (let i = 0; i < this.state.paramValues.length; i += 1) {
                  const locParamValue = this.state.paramValues[i];
                  if (locParamValue.paramName === value.paramName) {
                    locParamValue.value = parseFloat(value.value);
                    locParamValue.dt = value.dt;
                    locParamValue.qd = value.qd;
                    b = true;
                    break;
                  }
                }
                if (!b) {
                  let newParamValues = this.state.paramValues;
                  newParamValues.push(value);
                  this.setState({
                    paramValues: newParamValues,
                  });
                  b = true;
                }
              }
              if (b) {
                valuesUpdated = 1;
              }
            }
          );
        },
      },
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds,
    });
  }

  componentDidMount() {
    timerId = setInterval(() => {
      if (valuesUpdated > 0) {
        valuesUpdated = 0;
        this.setState({
          update: true,
        });
      }
    }, 1000);
  }

  componentWillUnmount() {
    MyStompClient.unsubscribeFromValues();
    clearInterval(timerId);

    this.setState({
      asutpCommunicationReses: [],
      paramValues: [],
    });
  }

  render() {
    return (
      <div>
        <AsutpCommunicationModelForm
          asutpRESes={this.state.asutpCommunicationReses}
          paramValues={this.state.paramValues}
          lastHistoryParam={this.state.lastHistoryParam}
          onReloadAsutpCommunicationModel={this.reloadAsutpComminicationModel}
          history={this.props.history}
        />
        <MyFetchClient
          cmdUid={this.state.cmdUid}
          fetchRequests={this.state.fetchRequests}
          // abort={this.state.abort}
          history={this.props.history}
        />
      </div>
    );
  }
}

AsutpCommunicationModelPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired,
  }),
};
