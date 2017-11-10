import React from 'react';
import PropTypes from 'prop-types';
import { Rect, Line, Circle, Group } from 'react-konva';


export default class MyRect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 'green',
    };
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // window.Konva is a global variable for Konva framework namespace
    this.setState({
      color: window.Konva.Util.getRandomColor(),
    });
  }

  handleDragEnd(args) {
    //const abspos = args.target.getAbsolutePosition();
    //const pos = args.target.position();
    //console.log(`Abs position of red is (${abspos.x}, ${abspos.y}) but its co-ords are (${pos.x}, ${pos.y})`);

    this.props.onDragEnd({
      id: this.props.node.id,
      x: args.target.x(),
      y: args.target.y(),
    });
  }

  render() {
    const x = this.props.node.x;
    const y = this.props.node.y;

    return (
      <Group
        x={x}
        y={y}
        draggable
        onDragend={this.handleDragEnd}
      >
        <Rect
          x={0}
          y={0}
          width={25}
          height={25}
          fill={this.state.color}
          shadowBlur={0}
          onClick={this.handleClick}
        />
        <Circle
          x={25}
          y={25}
          radius={20}
          stroke={'black'}
          strokeWidth={2}
          fill={this.state.color}
          shadowBlur={0}
          onClick={this.handleClick}
        />
        <Line
          points={[ 0, 0, 10 + 0, 23 + 0, 15 + 0, 60 + 0, 30 + 0, 60 + 0 ]}
          stroke={'red'}
          strokeWidth={1}
          lineCap={'round'}
          lineJoin={'round'}
          fill={'green'}
        />
      </Group>
    );
  }
}

MyRect.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  onDragEnd: PropTypes.func.isRequired,
};
