import React from "react";
import PropTypes from "prop-types";
import { Circle, Group, Rect } from "react-konva";
import Konva from "konva";
import Portal from "../ContextMenu/Portal";
import ContextMenu from "../ContextMenu/ContextMenu";

export default class MyMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedContextMenu: null
    };

    this.handleDblClick = this.handleDblClick.bind(this);

    this.handleMenuDragStart = this.handleMenuDragStart.bind(this);
    this.handleMenuDragEnd = this.handleMenuDragEnd.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMenuOptionSelected = this.handleMenuOptionSelected.bind(this);
  }

  handleMenuOptionSelected(option) {
    this.setState({ selectedContextMenu: null });
    this.props.onMenuItemSelected(option);
  }

  handleContextMenu(e) {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
    // const mousePosition = e.target.getStage().getPointerPosition();
    const mousePosition = {
      x: e.evt.clientX,
      y: e.evt.clientY
    };

    this.setState({
      selectedContextMenu: {
        type: "START",
        position: mousePosition
      }
    });
  }

  handleMenuDragStart(e) {
    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
  }

  handleMenuDragEnd(e) {
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    });
    this.props.onDragEnd(e);
  }

  handleDblClick() {
    this.props.onDoubleClick(this.props.node);
  }

  render() {
    const { selectedContextMenu } = this.state;

    return (
      <Group
        x={10}
        y={10}
        draggable
        onDblClick={this.handleDblClick}
        onDragStart={this.handleMenuDragStart}
        onDragEnd={this.handleMenuDragEnd}
        onclick={this.handleClick}
        onContextMenu={this.handleContextMenu}
      >
        {/* <Text x={25} y={0} fontSize={9} text={"Menu"} /> */}
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
        {selectedContextMenu && (
          <Portal>
            <ContextMenu
              {...selectedContextMenu}
              items={this.props.items}
              onOptionSelected={this.handleMenuOptionSelected}
            />
          </Portal>
        )}
      </Group>
    );
  }
}

MyMenu.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  items: PropTypes.array.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  onMenuItemSelected: PropTypes.func.isRequired
};
