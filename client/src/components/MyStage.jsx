import React from 'react';
import PropTypes from 'prop-types';
import { Layer, Stage } from 'react-konva';
import MyRect from './MyRect';


export default class MyStage extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // this.state = {
  //   //   nodes: [ ],
  //   // };
  // }


  render() {
    const recs = this.props.nodes;
    const locW = window.innerWidth - 30;
    const locH = window.innerHeight - 30;

    return (
      <Stage width={locW} height={locH}>
        <Layer>
          {recs.map(rec => (
            <MyRect
              key={rec.id}
              node={rec}
              onDragEnd={this.props.onDragEnd}
            />
          ))
        }
        </Layer>
      </Stage>
    );
  }
}

MyStage.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
  })).isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

