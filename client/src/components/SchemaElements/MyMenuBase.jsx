import React from "react";
import PropTypes from "prop-types";
import { Rect } from "react-konva";
import Konva from "konva";
import Portal from "../ContextMenu/Portal";
import ContextMenu from "../ContextMenu/ContextMenu";

export default class MyMenuBase extends React.Component {
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

  handleDblClick() {
    this.props.onDblClick();
  }

  handleMenuOptionSelected(option) {
    this.setState({ selectedContextMenu: null });
    this.props.onMenuItemSelected(option);
  }

  handleContextMenu(e) {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
    // const mousePosition = e.target.getStage().getPointerPosition();
    const mousePosition = {
      x: e.evt.pageX,
      y: e.evt.pageY
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

  componentDidUpdate(prevProps) {
    if (this.props.parentStageClicked !== prevProps.parentStageClicked) {
      if (this.state.selectedContextMenu) {
        this.setState({ selectedContextMenu: null });
      }
    }
  }

  render() {
    const { selectedContextMenu } = this.state;

    return (
      <>
        <Rect
          x={this.props.x}
          y={this.props.y}
          width={this.props.width}
          height={this.props.height}
          stroke={"black"}
          strokeWidth={0}
          closed={true}
          onDblClick={this.handleDblClick}
          onDragStart={this.handleMenuDragStart}
          onDragEnd={this.handleMenuDragEnd}
          onclick={this.handleClick}
          onContextMenu={this.handleContextMenu}
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
      </>
    );
  }
}

MyMenuBase.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  items: PropTypes.array.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  onMenuItemSelected: PropTypes.func.isRequired,
  parentStageClicked: PropTypes.bool.isRequired
};
