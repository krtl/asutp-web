import React from "react";
import PropTypes from "prop-types";
import SchemaManager from "../components/SchemaManager";
import MyFetchClient from "./MyFetchClient";
import MyStompClient from "../modules/MyStompClient";
import {MakeUid} from "../modules/MyFuncs";


const ASUTP_MAIN_SCHEMA_NAME = "ASUTP_MAIN_SCHEMA";
const MATCHING_ITEM_LIMIT = 500;

let valuesUpdated = 0;
let timerId;

export default class SchemaManagerContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // schemas: [],
      params: [],
      cmdUid: "",
      fetchRequests: []
    };

    // this.reloadSchemas = this.reloadSchemas.bind(this);
    // this.addNewCustomSchema = this.addNewCustomSchema.bind(this);
    // this.deleteCustomSchema = this.deleteCustomSchema.bind(this);

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

  componentDidMount() {
    // this.reloadSchemas();

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
    // this.setState({
    //   schemas: []
    // });

    MyStompClient.unsubscribeFromValues();
    clearInterval(timerId);

    this.setState({
      asutpCommunicationReses: [],
      paramValues: [],
    });    
  }

  // reloadSchemas() {
  //   const cmds = [
  //     {
  //       fetchUrl: "/prj/getSchemas",
  //       fetchMethod: "get",
  //       fetchData: "",
  //       fetchCallback: schemas => {
  //         let locSchemas = schemas.slice(0, MATCHING_ITEM_LIMIT);
  //         locSchemas.sort((r1, r2) => {
  //           if (r1.caption > r2.caption) {
  //             return 1;
  //           }
  //           if (r1.caption < r2.caption) {
  //             return -1;
  //           }
  //           return 0;
  //         });
  //         this.setState({
  //           schemas: locSchemas
  //         });
  //       }
  //     }
  //   ];

  //   this.setState({
  //     cmdUid: MakeUid(5),
  //     fetchRequests: cmds
  //   });
  // }

  // addNewCustomSchema(s) {
  //   const cmds = [
  //     {
  //       fetchUrl: "/api/addNewCustomSchema",
  //       fetchMethod: "post",
  //       fetchData: s,
  //       fetchCallback: () => {
  //         this.reloadSchemas();
  //       }
  //     }
  //   ];

  //   this.setState({
  //     cmdUid: MakeUid(5),
  //     fetchRequests: cmds
  //   });
  // }

  // deleteCustomSchema(s) {
  //   const cmds = [
  //     {
  //       fetchUrl: `/api/deleteCustomSchema?schemaName=${s}`,
  //       fetchMethod: "post",
  //       fetchData: "",
  //       fetchCallback: () => {
  //         this.reloadSchemas();
  //       }
  //     }
  //   ];

  //   this.setState({
  //     cmdUid: MakeUid(5),
  //     fetchRequests: cmds
  //   });
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !(nextState.doNotRender);
  // }

  render() {
    return (<div>
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
          // abort={this.state.abort}
          history={this.props.history}
        />
    </div>);
  }

  // render() {
  //   return (
  //     <div>
  //       <SchemaManager
  //         schemas={this.state.schemas}
  //         onReloadSchemas={this.reloadSchemas}
  //         onAddNewCustomSchema={this.addNewCustomSchema}
  //         onDeleteCustomSchema={this.deleteCustomSchema}
  //         history={this.props.history}
  //       />
  //       <MyFetchClient
  //         cmdUid={this.state.cmdUid}
  //         fetchRequests={this.state.fetchRequests}
  //         history={this.props.history}
  //       />
  //     </div>
  //   );
  // }
}

SchemaManagerContainer.propTypes = {
  history: PropTypes.object.isRequired
};
