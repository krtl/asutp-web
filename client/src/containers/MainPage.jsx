import React from "react";
import PropTypes from "prop-types";
import MainForm from "../components/MainForm";
import MyFetchClient from "./MyFetchClient";
// import MyStompClient from '../modules/MyStompClient';
import makeUid from "../modules/MyFuncs";
const MATCHING_ITEM_LIMIT = 2500;

let valuesUpdated = 0;
let timerId;

export default class MainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      schemas: [],
      update: false
    };
  }

  componentDidMount() {
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

    timerId = setInterval(() => {
      if (valuesUpdated > 0) {
        valuesUpdated = 0;
        this.setState({
          update: true
        });
        this.props.onIncCountOfUpdates();
      }
    }, 1000);
  }

  componentWillUnmount() {
    // MyStompClient.unsubscribeFromValues();
    clearInterval(timerId);
  }

  render() {
    return (
      <>
        <MainForm schemas={this.state.schemas} history={this.props.history} />
        <MyFetchClient
          cmdUid={this.state.cmdUid}
          fetchRequests={this.state.fetchRequests}
          history={this.props.history}
        />
      </>
    );
  }
}

MainPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
