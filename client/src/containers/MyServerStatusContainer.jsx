import React from "react";
import PropTypes from "prop-types";
import MyServerStatus from "../components/MyServerStatus/MyServerStatus";
import MyStompClient from "../modules/MyStompClient";
// import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import ErrorIcon from "@material-ui/icons/Error";

import "../components/MyServerStatus/MainStatus.css";

function MyServerCollisionsStatus(props) {
  const isActive = props.isActive;

  const handleClick = event => {
    // window.open(`/systemService`, "_blank");
    props.history.push(`/systemService`);
  };

  if (isActive) {
    return (
      <div>
        <IconButton
          size="small"
          color="secondary"
          aria-label="collision"
          onClick={handleClick}
        >
          <ErrorIcon />
        </IconButton>
      </div>
    );
  }
  return null;
}

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
        <div className="column">
          <MyServerCollisionsStatus
            isActive={this.state.serverStatus.collisionsCount}
            history={this.props.history}
          />
        </div>
        <div className="column">
          <MyServerStatus
            socketStatus={this.state.socketStatus}
            serverStatus={this.state.serverStatus}
          />
        </div>
      </div>
    );
  }
}

MyServerStatusContainer.propTypes = {
  history: PropTypes.object.isRequired
};
