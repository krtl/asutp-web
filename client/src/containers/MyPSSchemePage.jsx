import React from "react";
import PropTypes from "prop-types";
import MyPSSchemeForm from "../components/MyPSSchemeForm";
import MyFetchClient from "./MyFetchClient";
import MyStompClient from "../modules/MyStompClient";
import {MakeUid} from "../modules/MyFuncs";
import { connect } from "react-redux";
import { incCountOfUpdates } from "../reducers/actions";
// import {MyConsts} from '../modules/MyConsts';

const MATCHING_ITEM_LIMIT = 2500;

let valuesUpdated = 0;
let timerId;

class PSSchemePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      psName: "",
      psInfo: undefined,
      nodes: [],
      wires: [],
      params: [],
      update: false
    };

    this.onLoadScheme = this.onLoadScheme.bind(this);
    this.onSaveScheme = this.onSaveScheme.bind(this);
    this.onResetSchema = this.onResetSchema.bind(this);
    this.onSaveParamManualValue = this.onSaveParamManualValue.bind(this);
    this.onSaveConnectionManualValue = this.onSaveConnectionManualValue.bind(
      this
    );
  }

  componentDidMount() {
    timerId = setInterval(() => {
      if (valuesUpdated > 0) {
        valuesUpdated = 0;
        this.setState({
          update: true
        });
      }
    }, 1000);
  }

  componentWillUnmount() {
    MyStompClient.unsubscribeFromValues();
    clearInterval(timerId);

    this.setState({
      nodes: [],
      wires: []
    });
  }

  onLoadScheme(psName) {
    if (psName === "") {
      psName = window.location.href.slice(
        window.location.href.lastIndexOf("/") + 1
      );
    }

    this.setState({
      psName: psName,
      nodes: [],
      wires: []
    });

    const cmds = [
      {
        fetchUrl: `/getPSInfo?name=${psName}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: data => {
          this.setState({
            psInfo: data
          });
        }
      },
            
      {
        fetchUrl: `/getPSParams?name=${psName}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: params => {
          this.setState({
            params: params.slice(0, MATCHING_ITEM_LIMIT)
          });
        }
      },

      {
        fetchUrl: `/getPSSchema?name=${psName}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: schema => {
          this.setState({
            nodes: schema.nodes,
            wires: schema.wires
          });

          MyStompClient.subscribeToValues(psName, value => {
            let b = false;

            // console.log(value);

            if ("nodeName" in value) {
              for (let i = 0; i < this.state.nodes.length; i += 1) {
                const locNode = this.state.nodes[i];
                if (locNode.name === value.nodeName) {
                  locNode.powered = value.newState;
                  locNode.qd = value.qd;
                  b = true;
                  break;
                }
              }
            }
            if ("connectorName" in value) {
              for (let i = 0; i < this.state.nodes.length; i += 1) {
                const locNode = this.state.nodes[i];
                if (locNode.name === value.connectorName) {
                  locNode.switchedOn = value.newState;
                  locNode.qd = value.qd;
                  b = true;
                  break;
                }
              }
            }
            if ("paramName" in value) {
              for (let i = 0; i < this.state.params.length; i += 1) {
                const locParam = this.state.params[i];
                if (locParam.name === value.paramName) {
                  locParam.value = parseFloat(value.value);
                  locParam.dt = value.dt;
                  locParam.qd = value.qd;
                  b = true;
                  break;
                }
              }
            }
            if (b) {
              valuesUpdated = 1;
            }
          });
        }
      }
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds
    });
  }

  onSaveScheme(s) {
    const cmds = [
      {
        fetchUrl: `/api/saveNodeCoordinates?schemaName=${this.state.psName}`,
        fetchMethod: "post",
        fetchData: s,
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

  onResetSchema() {
    const cmds = [
      {
        fetchUrl: `/api/resetNodeCoordinates?schemaName=${this.state.psName}`,
        fetchMethod: "post",
        fetchData: "",
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

  onSaveParamManualValue(s) {
    const cmds = [
      {
        fetchUrl: "/api/saveParamManualValue",
        fetchMethod: "post",
        fetchData: s,
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

  onSaveConnectionManualValue(s) {
    const cmds = [
      {
        fetchUrl: "/api/saveConnectionManualValue",
        fetchMethod: "post",
        fetchData: s,
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
    this.props.onIncCountOfUpdates();

    return (
      <div>
        <MyPSSchemeForm
          psInfo={this.state.psInfo}
          nodes={this.state.nodes}
          wires={this.state.wires}
          params={this.state.params}
          onLoadScheme={this.onLoadScheme}
          onSaveScheme={this.onSaveScheme}
          onResetSchema={this.onResetSchema}
          onSaveParamManualValue={this.onSaveParamManualValue}
          onSaveConnectionManualValue={this.onSaveConnectionManualValue}
          history={this.props.history}
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

PSSchemePage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  }),
  onIncCountOfUpdates: PropTypes.func.isRequired
};

export default connect(
  null,
  dispatch => ({
    onIncCountOfUpdates: payload => {
      dispatch(incCountOfUpdates(payload));
    }
  })
)(PSSchemePage);
