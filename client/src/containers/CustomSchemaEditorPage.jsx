import React from "react";
import PropTypes from "prop-types";
import CustomSchemaEditor from "../components/CustomSchemaEditor";
import MyFetchClient from "./MyFetchClient";
import makeUid from "../modules/MyFuncs";

// import {MyConsts} from '../modules/MyConsts';

// const MATCHING_ITEM_LIMIT = 10000;

export default class CustomSchemaEditorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      schemaName: this.props.history.location.pathname.replace(
        "/customSchemaEditor/",
        ""
      ),
      nodes: [],
      wires: [],
      update: false
    };

    this.onLoadScheme = this.onLoadScheme.bind(this);
    this.onSaveScheme = this.onSaveScheme.bind(this);
    this.onResetSchema = this.onResetSchema.bind(this);
    this.onAddNode = this.onAddNode.bind(this);
    this.onDeleteNode = this.onDeleteNode.bind(this);
  }

  componentDidMount() {
    //
  }

  componentWillUnmount() {
    this.setState({ nodes: [], wires: [] });
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

  onAddNode(s) {
    const cmds = [
      {
        fetchUrl: "/api/custonSchemaAddNode",
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

  onDeleteNode(s) {
    const cmds = [
      {
        fetchUrl: "/api/custonSchemaDeleteNode",
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

  render() {
    return (
      <div>
        <CustomSchemaEditor
          schemaName={this.props.schemaName}
          schema={this.props.schema}
          nodes={this.state.nodes}
          wires={this.state.wires}
          onLoadScheme={this.onLoadScheme}
          onSaveScheme={this.onSaveScheme}
          onResetSchema={this.onResetSchema}
          onAddNode={this.onAddNode}
          onDeleteNode={this.onDeleteNode}
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

CustomSchemaEditorPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
