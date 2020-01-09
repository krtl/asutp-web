import React from "react";
import PropTypes from "prop-types";
import MyServerStatus from "../components/MyServerStatus/MyServerStatus";
import MyStompClient from "../modules/MyStompClient";

export default class MyServerStatusContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      socketStatus: "unknown",
      serverStatus: {}
    };
  }

  componentDidMount() {
    MyStompClient.setConnectedCallback(err => {
      if (err) {
        let text = err;
        if (err.type) {
          if (err.type === "close") {
            text = "closed";
          } else {
            text = err.type;
            if (err.reason) text += ` ${err.reason}`;
          }
        }
        this.setState({
          socketStatus: text,
          serverStatus: {}
        });
      } else {
        this.setState({
          socketStatus: "connected"
        });
        MyStompClient.subscribeToServerStatus(value => {
          // console.log(value);
          this.setState({
            serverStatus: value
          });
        });
      }
    });
  }

  componentWillUnmount() {
    MyStompClient.unsubscribeFromServerStatus();
  }

  render() {
    return (
      <div>
        <MyServerStatus
          socketStatus={this.state.socketStatus}
          serverStatus={this.state.serverStatus}
        />
      </div>
    );
  }
}

MyServerStatusContainer.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};
