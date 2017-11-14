import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';


export default class MyIdButton extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onClick(this.props.id);
  }

  render() {
    return (
      <RaisedButton
        onClick={this.handleClick}
      >
        {this.props.text}
      </RaisedButton>
    );
  }
}

MyIdButton.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

MyIdButton.defaultProps = {
};

