import React from "react";
import PropTypes from "prop-types";
import SchemaManager from "../components/SchemaManager";
import MyFetchClient from "./MyFetchClient";
import makeUid from "../modules/MyFuncs";

const MATCHING_ITEM_LIMIT = 10000;

export default class SchemaManagerContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schemas: [],
      cmdUid: "",
      fetchRequests: []
    };

    this.reloadSchemas = this.reloadSchemas.bind(this);
    this.addNewCustomSchema = this.addNewCustomSchema.bind(this);
    this.deleteCustomSchema = this.deleteCustomSchema.bind(this);
  }

  componentDidMount() {
    this.reloadSchemas();
  }

  componentWillUnmount() {
    this.setState({
      schemas: []
    });
  }

  reloadSchemas() {
    const cmds = [
      {
        fetchUrl: "/getSchemas",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: schemas => {
          let locSchemas = schemas.slice(0, MATCHING_ITEM_LIMIT);
          locSchemas.sort((r1, r2) => {
            if (r1.caption > r2.caption) {
              return 1;
            }
            if (r1.caption < r2.caption) {
              return -1;
            }
            return 0;
          });
          this.setState({
            schemas: locSchemas
          });
        }
      }
    ];

    this.setState({
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  addNewCustomSchema(s) {
    const cmds = [
      {
        fetchUrl: "/api/addNewCustomSchema",
        fetchMethod: "post",
        fetchData: s,
        fetchCallback: () => {
          this.reloadSchemas();
        }
      }
    ];

    this.setState({
      cmdUid: makeUid(5),
      fetchRequests: cmds
    });
  }

  deleteCustomSchema(s) {
    const cmds = [
      {
        fetchUrl: `/api/deleteCustomSchema?schemaName=${s}`,
        fetchMethod: "post",
        fetchData: "",
        fetchCallback: () => {
          this.reloadSchemas();
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
        <SchemaManager
          schemas={this.state.schemas}
          onReloadSchemas={this.reloadSchemas}
          onAddNewCustomSchema={this.addNewCustomSchema}
          onDeleteCustomSchema={this.deleteCustomSchema}
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

SchemaManagerContainer.propTypes = {
  history: PropTypes.object.isRequired
};
