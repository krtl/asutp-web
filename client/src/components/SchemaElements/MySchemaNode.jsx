import React from "react";
import PropTypes from "prop-types";
import { Text, Rect, Circle, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import MySchemaNodeLEP from "./MySchemaNodeLEP";
import MySchemaNodePS from "./MySchemaNodePS";
import MySchemaNodeTransformer from "./MySchemaNodeTransformer";
import MySchemaNodeSection from "./MySchemaNodeSection";
import MySchemaNodeConnector from "./MySchemaNodeConnector";
import MySchemaNodeParam from "./MySchemaNodeParam";

export default class MySchemaNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleDblClick = this.handleDblClick.bind(this);
  }

  handleDblClick() {
    this.props.onDoubleClick(this.props.node);
  }

  handleDragEnd(args) {
    this.props.onDragEnd({
      id: this.props.node.id,
      name: this.props.node.name,
      x: args.target.x(),
      y: args.target.y()
    });
  }

  handleMouseOut(args) {
    this.props.onMouseOut(args);
  }

  handleMouseOver(args) {
    this.props.onMouseOver(args);
  }

  render() {
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

    switch (this.props.node.nodeType) {
      case MyConsts.NODE_TYPE_LEP: {
        return (
          <MySchemaNodeLEP
            node={this.props.node}
            editMode={this.props.editMode}
            doOnDeleteNode={this.props.doOnDeleteNode}
            color={color}
            parentStageClicked={this.props.parentStageClicked}
            onDragEnd={this.handleDragEnd}
            onDoubleClick={this.handleDblClick}
            history={this.props.history}
          />
        );
      }
      case MyConsts.NODE_TYPE_PS: {
        return (
          <MySchemaNodePS
            node={this.props.node}
            editMode={this.props.editMode}
            doOnDeleteNode={this.props.doOnDeleteNode}
            color={color}
            parentStageClicked={this.props.parentStageClicked}
            onDragEnd={this.handleDragEnd}
            onDoubleClick={this.handleDblClick}
            history={this.props.history}
          />
        );
      }
      case MyConsts.NODE_TYPE_TRANSFORMER: {
        return (
          <MySchemaNodeTransformer
            node={this.props.node}
            editMode={this.props.editMode}
            color={color}
            parentStageClicked={this.props.parentStageClicked}
            onDragEnd={this.handleDragEnd}
            onDoubleClick={this.handleDblClick}
            history={this.props.history}
          />
        );
      }
      case MyConsts.NODE_TYPE_SECTION: {
        return (
          <MySchemaNodeSection
            node={this.props.node}
            editMode={this.props.editMode}
            color={color}
            parentStageClicked={this.props.parentStageClicked}
            onDragEnd={this.handleDragEnd}
            onDoubleClick={this.handleDblClick}
            history={this.props.history}
          />
        );
      }
      case MyConsts.NODE_TYPE_SECTIONCONNECTOR:
      case MyConsts.NODE_TYPE_SEC2SECCONNECTOR: {
        return (
          <MySchemaNodeConnector
            node={this.props.node}
            editMode={this.props.editMode}
            color={color}
            parentStageClicked={this.props.parentStageClicked}
            onDragEnd={this.handleDragEnd}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            onDoubleClick={this.handleDblClick}
            history={this.props.history}
          />
        );
      }

      case MyConsts.NODE_TYPE_PARAM: {
        return (
          <MySchemaNodeParam
            node={this.props.node}
            editMode={this.props.editMode}
            color={color}
            parentStageClicked={this.props.parentStageClicked}
            onDragEnd={this.handleDragEnd}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            onDoubleClick={this.handleDblClick}
            history={this.props.history}
          />
        );
      }
      default: {
        return (
          <Group x={x} y={y} draggable onDragend={this.handleDragEnd}>
            <Circle
              x={10}
              y={10}
              radius={10}
              stroke={"black"}
              strokeWidth={2}
              fill={color}
              shadowBlur={0}
              onDblClick={this.handleDblClick}
            />
            <Text x={30} y={10} text={this.props.node.name} />
            <Rect
              x={18}
              y={18}
              width={4}
              height={4}
              stroke={"black"}
              strokeWidth={1}
              fill={color}
              shadowBlur={0}
              onDblClick={this.handleDblClick}
            />
            <Text x={21} y={0} fontSize={9} text={this.props.node.caption} />
          </Group>
        );
      }
    }
  }
}

MySchemaNode.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    powered: PropTypes.number
  }).isRequired,
  editMode: PropTypes.bool.isRequired,
  parentStageClicked: PropTypes.bool.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onMouseOut: PropTypes.func,
  onMouseOver: PropTypes.func,
  onDoubleClick: PropTypes.func.isRequired,
  doOnDeleteNode: PropTypes.func,
  history: PropTypes.object.isRequired
};
