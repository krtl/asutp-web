import React from "react";
import PropTypes from "prop-types";
// import { Text, Circle, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import MyMenuBase from "./MyMenuBase";

const optionHistory = "History";

export default class MySchemaNodeTransformer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDblClick = this.handleDblClick.bind(this);

    this.handleMenuOptionSelected = this.handleMenuOptionSelected.bind(this);
  }

  handleMenuOptionSelected(option) {
    console.log(option);

    switch (option) {
      case optionHistory: {
        window.open(`/nodeStateHistory/${this.props.node.name}`, "_blank");
        break;
      }
      default: {
        break;
      }
    }
  }

  handleDragEnd(args) {
    this.props.onDragEnd(args);
  }

  handleDblClick() {
    this.props.onDoubleClick(this.props.node);
  }
  
  render() {
    return (<div></div>);
  }

  // render() {
  //   const x = this.props.node.x;
  //   const y = this.props.node.y;

  //   const body = (
  //     <>
  //       <Text
  //         x={MyConsts.NODE_PS_RADIUS * 3}
  //         y={2}
  //         fontSize={9}
  //         text={this.props.node.name}
  //       />
  //       <Circle
  //         x={5}
  //         y={10}
  //         radius={10}
  //         stroke={"black"}
  //         strokeWidth={2}
  //         fill={this.props.color}
  //         shadowBlur={0}
  //         onDblClick={this.handleDblClick}
  //       />
  //       <Circle
  //         x={15}
  //         y={10}
  //         radius={10}
  //         stroke={"black"}
  //         strokeWidth={2}
  //         fill={this.props.color}
  //         shadowBlur={0}
  //         onDblClick={this.handleDblClick}
  //       />
  //       <Text
  //         x={MyConsts.NODE_PS_RADIUS * 3}
  //         y={12}
  //         fontSize={9}
  //         text={this.props.node.caption}
  //       />
  //       <MyMenuBase
  //         x={0}
  //         y={0}
  //         width={2 * MyConsts.NODE_PS_RADIUS}
  //         height={2 * MyConsts.NODE_PS_RADIUS}
  //         onDoubleClick={this.handleDblClick}
  //         onContextMenu={this.handleContextMenu}
  //         items={[optionHistory]}
  //         onMenuItemSelected={this.handleMenuOptionSelected}
  //         parentStageClicked={this.props.parentStageClicked}
  //       />
  //     </>
  //   );
  //   return this.props.editMode ? (
  //     <Group x={x} y={y} draggable onDragend={this.handleDragEnd}>
  //       {body}
  //     </Group>
  //   ) : (
  //     <Group x={x} y={y}>
  //       {body}
  //     </Group>
  //   );
  // }
}

MySchemaNodeTransformer.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    powered: PropTypes.number
  }).isRequired,
  editMode: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  parentStageClicked: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
};
