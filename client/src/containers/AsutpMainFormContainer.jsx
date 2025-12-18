import React from "react";
import PropTypes from "prop-types";
import AsutpMainForm from "../components/AsutpMainForm";
import MyFetchClient from "./MyFetchClient";
import MyStompClient from "../modules/MyStompClient";
import {MakeUid} from "../modules/MyFuncs";


const ASUTP_MAIN_SCHEMA_NAME = "ASUTP_MAIN_SCHEMA";
const MATCHING_ITEM_LIMIT = 500;

let valuesUpdated = 0;
let timerId;

export default class AsutpMainFormContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      params: [],
      paramValues: [],
      update: false,
      cmdUid: "",
      fetchRequests: []
    };

    this.reloadAsutpMainForm = this.reloadAsutpMainForm.bind(this);    
  }

  reloadAsutpMainForm() {
    this.setState({
      asutpCommunicationReses: [],
      paramValues: [],
    });

    const cmds = [
      {
        fetchUrl: "/prj/getAsutpMainFormParams",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (values) => {
          this.setState({
            params: values.slice(0, MATCHING_ITEM_LIMIT),
          });

          MyStompClient.subscribeToValues(
            ASUTP_MAIN_SCHEMA_NAME,
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
         <AsutpMainForm
           params={this.state.params}
           paramValues={this.state.paramValues}
           onReloadAsutpMainForm={this.reloadAsutpMainForm}
           history={this.props.history}
         />
        <MyFetchClient
          cmdUid={this.state.cmdUid}
          fetchRequests={this.state.fetchRequests}
          // abort={this.state.abort}
          history={this.props.history}
        />
    </div>);
  }

}

AsutpMainFormContainer.propTypes = {
  history: PropTypes.object.isRequired
};
