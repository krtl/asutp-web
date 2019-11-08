import React, { Component } from "react";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";

function MySpinner(props) {
  const isActive = props.isActive;
  if (isActive) {
    return <CircularProgress size={20} />;
  }
  return null;
}

function MyDebugData(props) {
  return <small>{props.countOfUpdates}</small>;
}

class MainStatus extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    //  this.props.onClick(this.props.id);
  }

  render() {
    return (
      // <MySpinner isActive={this.props.nowLoading} />
      <>
        <MyDebugData countOfUpdates={this.props.countOfUpdates} />
        <MySpinner isActive={this.props.nowLoading} />
      </>
    );
  }
}

MainStatus.propTypes = {
  nowLoading: PropTypes.bool,
  countOfUpdates: PropTypes.number
};

MainStatus.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
  nowLoading: state.mainStatus.nowLoading,
  countOfUpdates: state.mainStatus.countOfUpdates
});

export default connect(mapStateToProps)(MainStatus);
