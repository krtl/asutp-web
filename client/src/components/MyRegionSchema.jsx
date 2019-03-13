import React from 'react';
import PropTypes from 'prop-types';
import { Layer, Stage, Line } from 'react-konva';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import MySchemaNode from './MySchemaNode';
import {MyConsts} from '../modules/MyConsts';


const styles = {
  customWidth: {
    width: 350,
  },
}

export default class MyStage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRegion: '',
      edited: false,
      stateChanged: false,
    };
    this.handleLoadSchemeClick = this.handleLoadSchemeClick.bind(this);
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  getCenterX(node) {
    switch (node.nodeType) {
      case MyConsts.NODE_TYPE_LEP: return MyConsts.NODE_LEP_WIDTH / 2;
      case MyConsts.NODE_TYPE_PS: return MyConsts.NODE_PS_RADIUS;
      default: return 0;
    }
  }

  getCenterY(node) {
    switch (node.nodeType) {
      case MyConsts.NODE_TYPE_LEP: return MyConsts.NODE_LEP_Y_OFFSET + MyConsts.NODE_LEP_HEIGHT / 2;
      case MyConsts.NODE_TYPE_PS: return MyConsts.NODE_PS_RADIUS;
      default: return 0;
    }
  }

  getLines() {
    const result = [];
    if (this.props.wires) {
        for (let i = 0; i < this.props.wires.length; i += 1) {
          const locWire = this.props.wires[i];
          const locNode1 = this.props.nodes.find(node => node.name === locWire.nodeFrom);
          const locNode2 = this.props.nodes.find(node => node.name === locWire.nodeTo);
          if ((locNode1 !== undefined) && (locNode2 !== undefined)) {
            result.push(
              {
                name: this.props.wires[i].name,
                points: [ locNode1.x + this.getCenterX(locNode1), locNode1.y + this.getCenterY(locNode1),
                   locNode2.x + this.getCenterX(locNode2), locNode2.y + this.getCenterY(locNode2) ],
              });
          }
        }
      }
    return result;
  }

  doLoadScheme(selectedRegion) {

    if (selectedRegion === undefined) {
      selectedRegion = this.state.selectedRegion;
    }

    if (selectedRegion) {
      this.props.onLoadScheme(selectedRegion.name);
    }
  }

  handleLoadSchemeClick(selectedListItem) {
    this.doLoadScheme(this.state.selectedRegion);
  }

  handleRegionChange(event, index, value) {
    this.setState({ selectedRegion: value });
    this.doLoadScheme(value);
  }  

  handleSaveSchemeClick() {
    if (this.state.edited) {
      let nodes = [];
      this.props.nodes.forEach((node) => {
        // if (node.changed !== undefined) { //currently we save all scheme due to automatic redistribution on server side.
          nodes.push({ nodeName: node.name, x: node.x, y: node.y });
        // }
      });
      
      if (nodes.length > 0) {
        const s = JSON.stringify(nodes);
        this.props.onSaveScheme(s);
      }
    }
  }


  handleDragEnd(nodeObj) {
    const locNode = this.props.nodes.find(node => node.name === nodeObj.name);
    if (locNode !== undefined) {
      // console.log(`[MyStage] Drag ends for ${locNode.name}`);

      locNode.x = nodeObj.x;
      locNode.y = nodeObj.y;
      // locNode.changed = true;
      this.setState({
        edited: true });
    }
  }

  render() {
    const locNodes = this.props.nodes;
    const locLines = this.getLines();
    // const locW = window.innerWidth - 30;
    // const locH = window.innerHeight - 30;
    const locW = 3000;
    const locH = 5000;

    return (
      <div>
        <div>
          <SelectField
            floatingLabelText='Schemas:'
            value={this.state.selectedRegion}
            onChange={this.handleRegionChange}
            style={styles.customWidth}
          >
            {this.props.schemas.map(schema => (
              <MenuItem key={schema.name} value={schema} primaryText={schema.caption} secondaryText={schema.name} />
            ))
            }
          </SelectField>
          <RaisedButton onClick={this.handleLoadSchemeClick}>Load</RaisedButton>
          <RaisedButton onClick={this.handleSaveSchemeClick}>Save</RaisedButton>
        </div>

        <Stage width={locW} height={locH}>

          <Layer>
            {locNodes.map(rec => (
              <MySchemaNode
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
  schemas: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  wires: PropTypes.array.isRequired,
  onLoadScheme: PropTypes.func,
  onSaveScheme: PropTypes.func,
  onSaveManualValue: PropTypes.func,
};

