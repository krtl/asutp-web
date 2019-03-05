import React from 'react';
import PropTypes from 'prop-types';
import { Text, Rect, Circle, Group } from 'react-konva';
import {MyConsts} from '../modules/MyConsts';


export default class MyRect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // nodeState: props.node.nodeState,
      // x: props.node.x,
      // y: props.node.y,
    };
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    let newState = MyConsts.NODE_STATE_UNKNOWN;
    switch (this.props.node.nodeState) {
      case MyConsts.NODE_STATE_ON: {
        newState = MyConsts.NODE_STATE_OFF
        break;
        }
      case MyConsts.NODE_STATE_OFF: {
        newState = MyConsts.NODE_STATE_ON
        break;
        }
      default: {
        newState = MyConsts.NODE_STATE_OFF
        break;
        }
    }
    this.props.onStateChanged({ name: this.props.node.name, state: newState });

  // window.Konva is a global variable for Konva framework namespace
    // this.setState({
    //   color: window.Konva.Util.getRandomColor(),
    // });
  }

  handleDragEnd(args) {
    //const abspos = args.target.getAbsolutePosition();
    //const pos = args.target.position();
    //console.log(`Abs position of red is (${abspos.x}, ${abspos.y}) but its co-ords are (${pos.x}, ${pos.y})`);
    //console.log(`[MyRect] Drag ends for ${this.props.node.name}`);

    this.props.onDragEnd({
      id: this.props.node.id,
      name: this.props.node.name,
      x: args.target.x(),
      y: args.target.y(),
    });
  }

  render() {
    const x = this.props.node.x;
    const y = this.props.node.y;
    let color;
    switch (this.props.node.nodeState) {
      case MyConsts.NODE_STATE_ON: {
        color = 'red'
        break;
        }
      case MyConsts.NODE_STATE_OFF: {
        color = 'green'
        break;
        }
      default: {
        color = 'grey'
        break;
        }
    }

    switch (this.props.node.nodeType) {
      case MyConsts.NODE_TYPE_SECTION:
      case MyConsts.NODE_TYPE_LEP: {
        return (
          <Group
            x={x}
            y={y}
            draggable
            onDragend={this.handleDragEnd}
          >
            <Text
              x={1}
              y={0}
              fontSize={9}
              text={this.props.node.name}
            />
            <Rect
              x={0}
              y={MyConsts.NODE_LEP_Y_OFFSET}
              width={MyConsts.NODE_LEP_WIDTH}
              height={MyConsts.NODE_LEP_HEIGHT}
              stroke={'black'}
              strokeWidth={1}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Text
              x={1}
              y={20}
              fontSize={9}
              text={this.props.node.caption}
            />            
          </Group>
        );
      }
      case MyConsts.NODE_TYPE_TRANSFORMER: {
        return (
          <Group
            x={x}
            y={y}
            draggable
            onDragend={this.handleDragEnd}
          >
            <Text
              x={1}
              y={0}
              fontSize={9}
              text={this.props.node.name}
            />
            <Circle
              x={10}
              y={10}
              radius={10}
              stroke={'black'}
              strokeWidth={2}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Circle
              x={20}
              y={10}
              radius={10}
              stroke={'black'}
              strokeWidth={2}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Text
              x={1}
              y={20}
              fontSize={9}
              text={this.props.node.caption}
            />            
          </Group>
        );
      }
      case MyConsts.NODE_TYPE_SECTIONCONNECTOR:
      case MyConsts.NODE_TYPE_SEC2SECCONNECTOR: {
        return (
          <Group
            x={x}
            y={y}
            draggable
            onDragend={this.handleDragEnd}
          >
            <Text
              x={1}
              y={0}
              fontSize={9}
              text={this.props.node.name}
            />
            <Rect
              x={0}
              y={0}
              width={MyConsts.NODE_PS_RADIUS*2}
              height={MyConsts.NODE_PS_RADIUS*2}
              stroke={'black'}
              strokeWidth={1}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Text
              x={1}
              y={20}
              fontSize={9}
              text={this.props.node.caption}
            />            
          </Group>
        );
      }

      case MyConsts.NODE_TYPE_PS:{
        return (
          <Group
            x={x}
            y={y}
            draggable
            onDragend={this.handleDragEnd}
          >
            <Text
              x={25}
              y={0}
              fontSize={9}
              text={this.props.node.name}
            />
            <Circle
              x={10}
              y={10}
              radius={MyConsts.NODE_PS_RADIUS}
              stroke={'black'}
              strokeWidth={2}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Text
              x={0}
              y={22}
              fontSize={9}
              text={this.props.node.caption}
            />            

          </Group>
        );
        
      }
      default: {
        return (
          <Group
            x={x}
            y={y}
            draggable
            onDragend={this.handleDragEnd}
          >
            <Circle
              x={10}
              y={10}
              radius={10}
              stroke={'black'}
              strokeWidth={2}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Text
              x={30}
              y={10}
              text={this.props.node.name}
            />
            <Rect
              x={18}
              y={18}
              width={4}
              height={4}
              stroke={'black'}
              strokeWidth={1}
              fill={color}
              shadowBlur={0}
              onClick={this.handleClick}
            />
            <Text
              x={21}
              y={0}
              fontSize={9}
              text={this.props.node.caption} 
              />           
          </Group>
        );
      }
    }

  }
}

MyRect.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    nodeState: PropTypes.number,
  }).isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onStateChanged: PropTypes.func.isRequired,
};
