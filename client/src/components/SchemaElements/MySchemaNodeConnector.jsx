import React from "react";
import PropTypes from "prop-types";
// import { Text, Rect, Line, Group } from "react-konva";
import { MyConsts } from "../../modules/MyConsts";
import { GetBorderColor, InsertLineBreaks } from "../../modules/MyFuncs";
import MyMenuBase from "./MyMenuBase";

const optionHistory = "History";

export default class MySchemaNodeConnector extends React.Component {
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
    this.props.onMouseOut();
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
    // console.log(`connector doubleclick for ${this.props.node}`);
    this.props.onDoubleClick(this.props.node);
  }

  render() {
    return (<div></div>);
  }

  // render() {
  //   const x = this.props.node.x;
  //   const y = this.props.node.y;

  //   const captionAtTheTop = this.props.node.y <= 100;
  //   const captionY = captionAtTheTop ? -28 : 22;

  //   const body = (
  //     <>
  //       {/* <Text x={1} y={-10} fontSize={9} text={this.props.node.name} /> */}
  //       <Rect
  //         x={0}
  //         y={0}
  //         width={MyConsts.NODE_PS_RADIUS * 2}
  //         height={MyConsts.NODE_PS_RADIUS * 2}
  //         stroke={GetBorderColor(this.props.node.paramQD)}
  //         strokeWidth={2}
  //         fill={this.props.color}
  //         shadowBlur={0}
  //         onDblClick={this.handleDblClick}
  //         onMouseOut={this.handleMouseOut}
  //         onMouseOver={this.handleMouseOver}
  //         onMouseMove={this.handleMouseOver}
  //         onMouseDragMove={this.handleMouseOver}
  //       />

  //       {this.props.node.switchedOn ? (
  //         <Line
  //           points={[
  //             MyConsts.NODE_PS_RADIUS,
  //             MyConsts.NODE_PS_RADIUS * 2 - 2,
  //             MyConsts.NODE_PS_RADIUS,
  //             2
  //           ]}
  //           stroke={"black"}
  //           strokeWidth={1}
  //           lineJoin={"round"}
  //         />
  //       ) : (
  //         <Group x={0} y={0}>
  //           <Line
  //             points={[
  //               MyConsts.NODE_PS_RADIUS,
  //               MyConsts.NODE_PS_RADIUS * 2 - 2,
  //               MyConsts.NODE_PS_RADIUS,
  //               MyConsts.NODE_PS_RADIUS + 3,
  //               MyConsts.NODE_PS_RADIUS + 6,
  //               MyConsts.NODE_PS_RADIUS - 3
  //             ]}
  //             stroke={"black"}
  //             strokeWidth={1}
  //             lineJoin={"round"}
  //           />
  //           <Line
  //             points={[
  //               MyConsts.NODE_PS_RADIUS,
  //               MyConsts.NODE_PS_RADIUS - 3,
  //               MyConsts.NODE_PS_RADIUS,
  //               2
  //             ]}
  //             stroke={"black"}
  //             strokeWidth={1}
  //             lineJoin={"round"}
  //           />
  //         </Group>
  //       )}
  //       <Text
  //         x={1 - 2.5 * MyConsts.NODE_PS_RADIUS}
  //         y={captionY}
  //         fontSize={9}
  //         text={InsertLineBreaks(this.props.node.caption, 12)}
  //       />
  //       <MyMenuBase
  //         x={0}
  //         y={0}
  //         width={2 * MyConsts.NODE_PS_RADIUS}
  //         height={2 * MyConsts.NODE_PS_RADIUS}
  //         onDoubleClick={this.handleDblClick}
  //         items={[optionHistory]}
  //         onContextMenu={this.handleContextMenu}
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

MySchemaNodeConnector.propTypes = {
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
