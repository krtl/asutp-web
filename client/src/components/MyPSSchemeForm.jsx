import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText } from 'material-ui/Card';


export default class MyPSScheme extends React.Component {
  constructor(props) {
    super(props);

    this.handleReloadPSClick = this.handleReloadPSClick.bind(this);
  }

  componentDidMount() {
    this.props.onReloadPS(this.props.psName, true);
  }

  handleReloadPSClick() {
    this.props.onReloadPS(this.props.psName, false);
  }

  render() {


    return (
      
      <Card className='container'>
        <div>
          <CardText>{this.props.psName}</CardText>
          <RaisedButton onClick={this.handleReloadPSClick}>Reload</RaisedButton>
        </div>

        <CardText>{this.props.psJson}</CardText>
          
      </Card>
    );
  }
}

 MyPSScheme.propTypes = {
  psName: PropTypes.string,
  psJson: PropTypes.string,
  onReloadPS: PropTypes.func,
 };



