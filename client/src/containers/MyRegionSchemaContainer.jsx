import React from "react";
import PropTypes from "prop-types";
import MyRegionSchema from "../components/MyRegionSchema";
import MyFetchClient from "./MyFetchClient";
import makeUid from "../modules/MyFuncs";
import MyStompClient from "../modules/MyStompClient";
// import {MyConsts} from '../modules/MyConsts';

// const MATCHING_ITEM_LIMIT = 10000;

let valuesUpdated = 0;
let timerId;

export default class MyStageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      regionName: "",
      // doNotRender: false,
      nodes: [],
      wires: [],
      update: false
    };

    this.onLoadScheme = this.onLoadScheme.bind(this);
    this.onSaveScheme = this.onSaveScheme.bind(this);
    this.onResetSchema = this.onResetSchema.bind(this);
    this.onSaveManualValue = this.onSaveManualValue.bind(this);
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

  onLoadScheme(schemaName) {
    this.setState({
      regionName: schemaName,
      nodes: [],
      wires: []
    });

    const cmds = [
      {
        fetchUrl: `/getSchema?name=${schemaName}`,
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: schema => {
          this.setState({
            nodes: schema.nodes,
            wires: schema.wires
          });

          MyStompClient.subscribeToValues(schemaName, value => {
            if ("nodeName" in value) {
              let b = false;
              for (let i = 0; i < this.state.nodes.length; i += 1) {
                const locNode = this.state.nodes[i];
                if (locNode.name === value.nodeName) {
                  locNode.powered = value.newState;
                  locNode.qd = value.qd;
                  b = true;
                  break;
                }
              }
              if (b) {
                valuesUpdated = 1;
              }
            }
          });
        }
      }
    ];

    this.setState({
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  onSaveScheme(s) {
    const cmds = [
      {
        fetchUrl: `/api/saveNodeCoordinates?schemaName=${this.state.regionName}`,
        fetchMethod: "post",
        fetchData: s,
        fetchCallback: () => {
          // this.setState({
          // });
        }
      }
    ];

    this.setState({
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  onResetSchema() {
    const cmds = [
      {
        fetchUrl: `/api/resetNodeCoordinates?schemaName=${this.state.regionName}`,
        fetchMethod: "post",
        fetchData: "",
        fetchCallback: () => {
          // this.setState({
          // });
        }
      }
    ];

    this.setState({
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  onSaveManualValue(s) {
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
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !(nextState.doNotRender);
  // }

  render() {
    return (
      <div>
        <MyRegionSchema
          schemas={this.props.schemas}
          nodes={this.state.nodes}
          wires={this.state.wires}
          onLoadScheme={this.onLoadScheme}
          onSaveScheme={this.onSaveScheme}
          onResetSchema={this.onResetSchema}
          onSaveManualValue={this.onSaveManualValue}
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

MyStageContainer.propTypes = {
  schemas: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
};
