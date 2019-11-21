import React from "react";
import PropTypes from "prop-types";
import { Text, Rect, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import MyMenuBase from "./MyMenuBase";

const optionHistory = "History";

export default class MySchemaNodeParam extends React.Component {
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
    const x = this.props.node.x - MyConsts.NODE_PS_RADIUS;
    const y = this.props.node.y;

    let paramValueColor;
    if (this.props.node.paramQD) {
      if (this.props.node.paramQD.indexOf("B") > -1) {
        paramValueColor = "green";
      } else if (this.props.node.paramQD.indexOf("Z") > -1) {
        paramValueColor = "aquamarine";
      } else if (this.props.node.paramQD.indexOf("NA") > -1) {
        paramValueColor = "grey";
      } else {
        paramValueColor = "white";
      }
    }

    const body = <>
        <Text x={0} y={0} fontSize={9} text={this.props.node.name} />
        <Rect
          x={0}
          y={10}
          width={MyConsts.NODE_PS_RADIUS * 4}
          height={MyConsts.NODE_PS_RADIUS}
          stroke={"black"}
          strokeWidth={1}
          fill={paramValueColor}
          shadowBlur={0}
          onDblClick={this.handleDblClick}
        />
        <Text
          x={1}
          y={11}
          fontSize={9}
          text={this.props.node.caption}
          onDblClick={this.handleDblClick}
        />
        <Text x={1} y={21} fontSize={9} text={this.props.node.paramName} />

        <MyMenuBase
          x={0}
          y={0}
          width={2 * MyConsts.NODE_PS_RADIUS}
          height={2 * MyConsts.NODE_PS_RADIUS}
          onDoubleClick={this.handleDblClick}
          onContextMenu={this.handleContextMenu}
          items={[optionHistory]}
          onMenuItemSelected={this.handleMenuOptionSelected}
          parentStageClicked={this.props.parentStageClicked}
        />
    </>;
    
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

MySchemaNodeParam.propTypes = {
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
