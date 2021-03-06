import React from "react";
import PropTypes from "prop-types";
import { Circle, Group, Rect, Text } from "react-konva";
import MyMenuBase from "./MyMenuBase";

export default class MySchemaNodeMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleDblClick = this.handleDblClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleMenuOptionSelected = this.handleMenuOptionSelected.bind(this);
  }

  handleMenuOptionSelected(option) {
    this.props.onMenuItemSelected(option);
  }

  handleDragEnd(e) {
    this.props.onDragEnd(e);
  }

  handleDblClick() {
    this.props.onDoubleClick(this.props.node);
  }

  componentDidUpdate(prevProps) {
    if (this.props.parentStageClicked !== prevProps.parentStageClicked) {
      if (this.state.selectedContextMenu) {
        this.setState({ selectedContextMenu: null });
      }
    }
  }

  render() {
    return (
      <Group
        x={10}
        y={10}
        draggable
        onDblClick={this.handleDblClick}
        onDragEnd={this.handleDragEnd}
      >
        {/* <Text x={25} y={0} fontSize={9} text={"Menu"} /> */}
        {this.props.editMode ? (
          <Text x={3} y={0} fontSize={8} text="Edit" />
        ) : (
          <Text x={0} y={0} fontSize={7} text="Display" />
        )}
        <Rect
          x={0}
          y={0}
          width={20}
          height={15}
          stroke={"black"}
          strokeWidth={0}
          shadowBlur={0}
        />
        <Circle
          x={5}
          y={10}
          radius={2}
          stroke={"black"}
          strokeWidth={1}
          fill={"grey"}
          shadowBlur={0}
        />
        <Circle
          x={10}
          y={10}
          radius={2}
          stroke={"black"}
          strokeWidth={1}
          fill={"grey"}
          shadowBlur={0}
        />
        <Circle
          x={15}
          y={10}
          radius={2}
          stroke={"black"}
          strokeWidth={1}
          fill={"grey"}
          shadowBlur={0}
        />
        <MyMenuBase
          x={0}
          y={0}
          width={20}
          height={20}
          onContextMenu={this.handleContextMenu}
          items={this.props.items}
          onMenuItemSelected={this.handleMenuOptionSelected}
          parentStageClicked={this.props.parentStageClicked}
          onDoubleClick={this.handleDblClick}
        />
      </Group>
    );
  }
}

MySchemaNodeMenu.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  editMode: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  parentStageClicked: PropTypes.bool.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  onMenuItemSelected: PropTypes.func.isRequired
};
