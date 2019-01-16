import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';

function MySpinner(props) {
    const isActive = props.isActive
 if (isActive) {
   return <CircularProgress size={22} />;
 }
 return null;
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
        <MySpinner isActive={this.props.nowLoading}/>
        // { loading && <CircularProgress size={22} />}
    );
  }
}

MainStatus.propTypes = {
    nowLoading: PropTypes.bool,
};

MainStatus.defaultProps = {
};

const mapStateToProps = (state, ownProps) => ({
    nowLoading: true,
  });
  
export default connect(mapStateToProps)(MainStatus);

