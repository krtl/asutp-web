import React from "react";
import PropTypes from "prop-types";
import MyRegionSchema from "../components/MyRegionSchema";
import MyFetchClient from "./MyFetchClient";
import makeUid from "../modules/MyFuncs";
import MyStompClient from "../modules/MyStompClient";
import { connect } from "react-redux";
import { incCountOfUpdates } from "../reducers/actions";

// import {MyConsts} from '../modules/MyConsts';

const MATCHING_REGIONS_ITEM_LIMIT = 100000;

let valuesUpdated = 0;
let timerId;

class MyRegionSchemaContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      // doNotRender: false,
      regions: [],
      nodes: [],
      wires: [],
      update: false
    };

    this.loadScheme = this.loadScheme.bind(this);
    this.loadRegionsForSchemaEdit = this.loadRegionsForSchemaEdit.bind(this);
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

  componentDidUpdate(prevProps) {
    if (this.props.schema !== prevProps.schema) {
      this.loadScheme(this.props.schema.name);
    }
  }

  loadScheme(schemaName) {
    this.setState({
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

  loadRegionsForSchemaEdit(callback) {
    const cmds = [
      {
        fetchUrl: "/getRegionsNodesForSchemaEdit",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: regs => {
          let locRegion = regs.slice(0, MATCHING_REGIONS_ITEM_LIMIT);
          locRegion.sort((r1, r2) => {
            if (r1.caption > r2.caption) {
              return 1;
            }
            if (r1.caption < r2.caption) {
              return -1;
            }
            return 0;
          });
          this.setState({
            regions: locRegion
          });
          callback();
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
        fetchUrl: `/api/saveNodeCoordinates?schemaName=${this.props.schema.name}`,
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
        fetchUrl: `/api/resetNodeCoordinates?schemaName=${this.props.schema.name}`,
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
    this.props.onIncCountOfUpdates();
    return (
      <div>
        <MyRegionSchema
          schema={this.props.schema}
          regions={this.state.regions}
          nodes={this.state.nodes}
          wires={this.state.wires}
          onLoadScheme={this.loadScheme}
          onLoadRegionsForSchemaEdit={this.loadRegionsForSchemaEdit}
          onSaveScheme={this.onSaveScheme}
          onResetSchema={this.onResetSchema}
          onSaveManualValue={this.onSaveManualValue}
          onAddNewCustomSchema={this.onAddNewCustomSchema}
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

MyRegionSchemaContainer.propTypes = {
  schema: PropTypes.shape({
    name: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired
  }),
  history: PropTypes.object.isRequired,
  onIncCountOfUpdates: PropTypes.func.isRequired
};

export default connect(null, dispatch => ({
  onIncCountOfUpdates: payload => {
    dispatch(incCountOfUpdates(payload));
  }
}))(MyRegionSchemaContainer);
