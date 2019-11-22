import React from "react";
import PropTypes from "prop-types";
import { Text, Rect, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import MyMenuBase from "./MyMenuBase";

const optionHistory = "History";
const optionDeleteNode = "Delete";

export default class MySchemaNodeLEP extends React.Component {
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
      case optionDeleteNode: {
        this.props.doOnDeleteNode(this.props.node);
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
    const x = this.props.node.x;
    const y = this.props.node.y;

    const menuItems = this.props.editMode
      ? [optionDeleteNode, optionHistory]
      : [optionHistory];

    const body = (
      <>
        <Text x={20} y={0} fontSize={9} text={this.props.node.name} />
        <Rect
          x={MyConsts.NODE_LEP_X_OFFSET}
          y={MyConsts.NODE_LEP_Y_OFFSET}
          width={MyConsts.NODE_LEP_WIDTH}
          height={MyConsts.NODE_LEP_HEIGHT}
          stroke={"black"}
          strokeWidth={1}
          fill={this.props.color}
          shadowBlur={0}
          onDblClick={this.handleDblClick}
        />
        <Text x={20} y={20} fontSize={9} text={this.props.node.caption} />
        <MyMenuBase
          x={0}
          y={0}
          width={2 * MyConsts.NODE_PS_RADIUS}
          height={2 * MyConsts.NODE_PS_RADIUS}
          onDoubleClick={this.handleDblClick}
          onContextMenu={this.handleContextMenu}
          items={menuItems}
          onMenuItemSelected={this.handleMenuOptionSelected}
          parentStageClicked={this.props.parentStageClicked}
        />
      </>
    );

    return this.props.editMode ? (
      <Group x={x} y={y} draggable onDragend={this.handleDragEnd}>
        {body}
      </Group>
    ) : (
      <Group x={x} y={y}>
        {body}
      </Group>
    );
  }
}

MySchemaNodeLEP.propTypes = {
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
  doOnDeleteNode: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};
