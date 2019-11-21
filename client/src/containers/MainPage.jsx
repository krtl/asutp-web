import React from "react";
import PropTypes from "prop-types";
import MainForm from "../components/MainForm";
import MyFetchClient from "./MyFetchClient";
// import MyStompClient from '../modules/MyStompClient';

let valuesUpdated = 0;
let timerId;

export default class MainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      update: false
    };
  }

  componentDidMount() {
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
        <MainForm history={this.props.history} />
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
