import React from "react";
import PropTypes from "prop-types";
// import { Text, Rect, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import { RoundFloatString, GetBorderColor } from "../../modules/MyFuncs";
import MyMenuBase from "./MyMenuBase";

const optionHistory = "History";

export default class MySchemaNodeParam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
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

  handleMouseOut(args) {
    this.props.onMouseOut(args);
  }

  handleMouseOver(args) {
    if (args.evt) {
      this.props.onMouseOver({
        text: `${this.props.node.name}\n${this.props.node.paramName}`,
        x: args.evt.offsetX,
        y: args.evt.offsetY
      });
    }
  }

  handleDblClick() {
    this.props.onDoubleClick(this.props.node);
  }

  render() {
    return (<div></div>);
  }

  // render() {
  //   const x = this.props.node.x - MyConsts.NODE_PS_RADIUS;
  //   const y = this.props.node.y;

  //   const paramValue = RoundFloatString(this.props.node.paramValue, 7);

  //   const body = (
  //     <>
  //       {/* <Text x={0} y={-5} fontSize={9} text={this.props.node.name} /> */}
  //       <Rect
  //         x={0}
  //         y={5}
  //         width={MyConsts.NODE_PS_RADIUS * 4}
  //         height={MyConsts.NODE_PS_RADIUS}
  //         stroke={GetBorderColor(this.props.node.paramQD)}
  //         strokeWidth={2}
  //         fill={"gainsboro"}
  //         shadowBlur={0}
  //         onDblClick={this.handleDblClick}
  //         onMouseOut={this.handleMouseOut}
  //         onMouseOver={this.handleMouseOver}
  //         onMouseMove={this.handleMouseOver}
  //         onMouseDragMove={this.handleMouseOver}
  //       />
  //       <Text
  //         x={1}
  //         y={6}
  //         fontSize={9}
  //         text={`${paramValue}`}
  //         onDblClick={this.handleDblClick}
  //       />
  //       {/* <Text x={1} y={15} fontSize={9} text={this.props.node.paramName} /> */}

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
  //     <Group
  //       x={x}
  //       y={y}
  //       draggable
  //       onDragend={this.handleDragEnd}
  //       onMouseOut={this.handleMouseOut}
  //       onMouseOver={this.handleMouseOver}
  //       onMouseMove={this.handleMouseOver}
  //       onMouseDragMove={this.handleMouseOver}
  //     >
  //       {body}
  //     </Group>
  //   ) : (
  //     <Group
  //       x={x}
  //       y={y}
  //       onMouseOut={this.handleMouseOut}
  //       onMouseOver={this.handleMouseOver}
  //       onMouseMove={this.handleMouseOver}
  //       onMouseDragMove={this.handleMouseOver}
  //     >
  //       {body}
  //     </Group>
  //   );
  // }
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
  onMouseOut: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  parentStageClicked: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
};
