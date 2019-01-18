import React from 'react';
import PropTypes from 'prop-types';
import { Layer, Stage, Line } from 'react-konva';
import RaisedButton from 'material-ui/RaisedButton';
import MyRect from './MyRect';


export default class MyStage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited: false,
    };
    this.handleLoadSchemeClick = this.handleLoadSchemeClick.bind(this);
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  getLines() {
    const result = [];
    if (this.props.wires) {
        for (let i = 0; i < this.props.wires.length; i += 1) {
          const locWire = this.props.wires[i];
          const locNode1 = this.props.enodes.find(node => node.name === locWire.nodeFrom);
          const locNode2 = this.props.enodes.find(node => node.name === locWire.nodeTo);
          if ((locNode1 !== undefined) && (locNode2 !== undefined)) {
            result.push(
              {
                name: this.props.wires[i].name,
                points: [ locNode1.x, locNode1.y, locNode2.x, locNode2.y ],
              });
          }
        }
      }
    return result;
  }

  handleLoadSchemeClick() {
    this.props.onLoadScheme();

    // Client.loadNodes('test_proj', (nodes) => {
    //   this.setState({
    //     nodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
    //     enodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
    //     edited: false,
    //   });
    // });
    // Client.loadWires('test_proj', (wires) => {
    //   this.setState({
    //     wires: wires.slice(0, MATCHING_ITEM_LIMIT),
    //     edited: false,
    //   });
    // });
  }

  handleSaveSchemeClick() {
    if (this.state.edited) {
      const s = JSON.stringify(this.props.enodes);
      this.props.onSaveScheme(s);

      // const s = JSON.stringify(this.props.enodes);
      // Client.saveNodes(s, () => {
      //   this.setState({
      //     edited: false,
      //   });
      // });
    }
  }

  handleDragEnd(nodeObj) {
    const locNode = this.props.enodes.find(node => node.name === nodeObj.name);
    if (locNode !== undefined) {
      // console.log(`[MyStage] Drag ends for ${locNode.name}`);

      locNode.x = nodeObj.x;
      locNode.y = nodeObj.y;
      this.setState({
        edited: true });
    }
  }

  render() {
    const locNodes = this.props.nodes;
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

 MyStage.propTypes = {
  nodes: PropTypes.array.isRequired,
  enodes: PropTypes.array.isRequired,
  wires: PropTypes.array.isRequired,
  onLoadScheme: PropTypes.func,
  onSaveScheme: PropTypes.func,
 };

