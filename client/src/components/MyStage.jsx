import React from 'react';
// import PropTypes from 'prop-types';
import { Layer, Stage, Line } from 'react-konva';
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
      wires: [],
      edited: false,
    };
    this.handleLoadSchemeClick = this.handleLoadSchemeClick.bind(this);
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  getLines() {
    const result = [];
    for (let i = 0; i < this.state.wires.length; i += 1) {
      const locWire = this.state.wires[i];
      const locNode1 = this.state.enodes.find(node => node.name === locWire.nodeFrom);
      const locNode2 = this.state.enodes.find(node => node.name === locWire.nodeTo);
      if ((locNode1 !== 'undefined') && (locNode2 !== 'undefined')) {
        result.push(
          {
            name: this.state.wires[i].name,
            points: [ locNode1.x, locNode1.y, locNode2.x, locNode2.y ],
          });
      }
    }
    return result;
  }

  handleLoadSchemeClick() {
    Client.loadNodes('test_proj', (nodes) => {
      this.setState({
        nodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
        enodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
        edited: false,
      });
    });
    Client.loadWires('test_proj', (wires) => {
      this.setState({
        wires: wires.slice(0, MATCHING_ITEM_LIMIT),
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
    const locNode = this.state.enodes.find(node => node.name === nodeObj.name);
    if (locNode !== 'undefined') {
      // console.log(`[MyStage] Drag ends for ${locNode.name}`);

      locNode.x = nodeObj.x;
      locNode.y = nodeObj.y;
      this.setState({
        edited: true });
    }
  }

  render() {
    const locNodes = this.state.nodes;
    const locLines = this.getLines();
    const locW = window.innerWidth - 30;
    const locH = window.innerHeight - 30;

    return (
      <div>
        <RaisedButton onClick={this.handleLoadSchemeClick}>Load</RaisedButton>
        <RaisedButton onClick={this.handleSaveSchemeClick}>Save</RaisedButton>

        <Stage width={locW} height={locH}>


          <Layer>
            {locNodes.map(rec => (
              <MyRect
                key={rec.name}
                node={rec}
                onDragEnd={this.handleDragEnd}
              />
            ))
          }
            {locLines.map(line => (
              <Line
                key={line.name}
                points={line.points}
                stroke="black"
                strokeWidth={1}
              />
            ))
            }
          </Layer>
        </Stage>
      </div>
    );
  }
}

// MyStage.propTypes = {
// };

