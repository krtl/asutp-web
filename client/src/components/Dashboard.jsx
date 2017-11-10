import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import MyStage from './MyStage';
import Client from '../modules/Client';

const MATCHING_ITEM_LIMIT = 2500;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nodes: [],
      enodes: [],
      edited: false,
    };
    this.handleLoadSchemeClick = this.handleLoadSchemeClick.bind(this);
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  handleLoadSchemeClick() {
    Client.loadNodes('test_proj', (nodes) => {
      this.setState({
        nodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
        enodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
        edited: false,
      });
    });
  }

  handleSaveSchemeClick() {
    if (this.state.edited) {
      const s = JSON.stringify(this.state.enodes);
      Client.saveNodes(s, () => {
        this.setState({
          edited: false,
        });
      });
    }
  }

  handleDragEnd(nodeObj) {
    const locNode = this.state.enodes.find(node => node.id === nodeObj.id);
    if (locNode !== 'undefined') {
      locNode.x = nodeObj.x;
      locNode.y = nodeObj.y;
      this.setState({
        edited: true });
    }
  }

  render() {
    return (
      <Card className='container'>
        <CardTitle
          title='Sheme editor'
          subtitle='You should get access to this page only after authentication.'
        />
        <RaisedButton onClick={this.handleLoadSchemeClick}>Load</RaisedButton>
        <RaisedButton onClick={this.handleSaveSchemeClick}>Save</RaisedButton>


        {this.props.secretData && <CardText style={{ fontSize: '16px', color: 'green' }}>{this.props.secretData}</CardText>}

        <MyStage
          nodes={this.state.nodes}
          onDragEnd={this.handleDragEnd}
        />
      </Card>
    );
  }
}

Dashboard.propTypes = {
  secretData: PropTypes.string.isRequired,
};

export default Dashboard;
