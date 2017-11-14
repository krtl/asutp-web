import React from 'react';
import PropTypes from 'prop-types';
import { Layer, Stage } from 'react-konva';
import RaisedButton from 'material-ui/RaisedButton';
import MyRect from './MyRect';
import Client from '../modules/Client';


const MATCHING_ITEM_LIMIT = 2500;

export default class MyStage extends React.Component {
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
    const recs = this.state.nodes;
    const locW = window.innerWidth - 30;
    const locH = window.innerHeight - 30;

    return (
      <div>
        <RaisedButton onClick={this.handleLoadSchemeClick}>Load</RaisedButton>
        <RaisedButton onClick={this.handleSaveSchemeClick}>Save</RaisedButton>

        <Stage width={locW} height={locH}>


          <Layer>
            {recs.map(rec => (
              <MyRect
                key={rec.id}
                node={rec}
                onDragEnd={this.handleDragEnd}
              />
            ))
          }
          </Layer>
        </Stage>
      </div>
    );
  }
}

MyStage.propTypes = {
};

