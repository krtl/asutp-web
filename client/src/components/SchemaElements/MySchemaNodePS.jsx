import React from "react";
import PropTypes from "prop-types";
import { Text, Circle, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import Konva from "konva";
import Portal from "../ContextMenu/Portal";
import ContextMenu from "../ContextMenu/ContextMenu";

const optionOpenInNewTab = "Open in new tab";
const optionOpenInThisTab = "Open";

export default class MySchemaNodePS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedContextMenu: null
    };

    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDblClick = this.handleDblClick.bind(this);

    this.handleMenuDragStart = this.handleMenuDragStart.bind(this);
    this.handleMenuDragEnd = this.handleMenuDragEnd.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMenuOptionSelected = this.handleMenuOptionSelected.bind(this);
  }

  handleMenuOptionSelected(option) {
    console.log(option);
    this.setState({ selectedContextMenu: null });

    if (option === optionOpenInNewTab) {
      window.open(`/psScheme/${this.props.node.name}`, "_blank");
    } else if (option === optionOpenInThisTab) {
      this.props.history.push(`/psScheme/${this.props.node.name}`);
    }
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
  }

  handleDblClick() {
    this.props.onDoubleClick(this.props.node);
  }

  handleDragEnd(args) {
    this.props.onDragEnd(args);
  }

  render() {
    const { selectedContextMenu } = this.state;

    const x = this.props.node.x;
    const y = this.props.node.y;
    let color;
    switch (this.props.node.powered) {
      case MyConsts.POWERED_ON: {
        color = "red";
        break;
      }
      case MyConsts.POWERED_OFF: {
        color = "green";
        break;
      }
      default: {
        color = "grey";
        break;
      }
    }

    return (
      <Group x={x} y={y} draggable onDragend={this.handleDragEnd}>
        <Text x={25} y={0} fontSize={9} text={this.props.node.name} />
        <Circle
          x={10}
          y={10}
          radius={MyConsts.NODE_PS_RADIUS}
          stroke={"black"}
          strokeWidth={2}
          fill={color}
          shadowBlur={0}
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
              items={[optionOpenInNewTab, optionOpenInThisTab]}
              onOptionSelected={this.handleMenuOptionSelected}
            />
          </Portal>
        )}
        <Text x={0} y={22} fontSize={9} text={this.props.node.caption} />
      </Group>
    );
  }
}

MySchemaNodePS.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    powered: PropTypes.number
  }).isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};
