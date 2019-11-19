import React from "react";
import PropTypes from "prop-types";
import { Text, Rect, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import MyMenuBase from "./MyMenuBase";

const optionHistory = "History";

export default class MySchemaNodeSection extends React.Component {
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
    const x = this.props.node.x;
    const y = this.props.node.y;

    return (
      <Group x={x} y={y} draggable onDragend={this.handleDragEnd}>
        <Text x={1} y={-10} fontSize={9} text={this.props.node.name} />
        <Rect
          x={0 - MyConsts.NODE_PS_RADIUS * 4}
          y={0}
          width={MyConsts.NODE_PS_RADIUS * 10}
          height={MyConsts.NODE_SECTION_HEIGHT}
          stroke={"black"}
          strokeWidth={1}
          fill={this.props.color}
          shadowBlur={0}
          onDblClick={this.handleDblClick}
        />
        <Text x={1} y={10} fontSize={9} text={this.props.node.caption} />
        <MyMenuBase
          x={0}
          y={0}
          width={MyConsts.NODE_PS_RADIUS * 10}
          height={MyConsts.NODE_SECTION_HEIGHT}
          onDoubleClick={this.handleDblClick}
          onContextMenu={this.handleContextMenu}
          items={[optionHistory]}
          onMenuItemSelected={this.handleMenuOptionSelected}
          parentStageClicked={this.props.parentStageClicked}
        />
      </Group>
    );
  }
}

MySchemaNodeSection.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    powered: PropTypes.number
  }).isRequired,
  color: PropTypes.string.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  parentStageClicked: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
};
