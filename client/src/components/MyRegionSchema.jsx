import React from "react";
import PropTypes from "prop-types";
import { Layer, Stage, Line } from "react-konva";
import MySchemaNode from "./SchemaElements/MySchemaNode";
import MySchemaNodeMenu from "./SchemaElements/MySchemaNodeMenu";
import DialogAddNode from "./Dialogs/DialogAddNode";
import { MyConsts } from "../modules/MyConsts";

const optionShemaToEditMode = "EditMode";
const optionShemaToDisplayMode = "DisplayMode";
const optionShemaLoad = "Reload";
const optionShemaSave = "Save";
const optionShemaAddNode = "AddNode";
const optionShemaReset = "Reset";
const optionShemaHistory = "History";

export default class MyRegionSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited: false,
      stateChanged: false,
      stageClicked: false,

      editMode: false,
      openDialogAddNode: false
    };
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleResetSchemaClick = this.handleResetSchemaClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);

    this.handleMenuItemSelected = this.handleMenuItemSelected.bind(this);
    this.handleStageClick = this.handleStageClick.bind(this);

    this.handleDialogAddNodeClose = this.handleDialogAddNodeClose.bind(this);
  }

  handleMenuItemSelected(option) {
    // console.log(option);
    switch (option) {
      case optionShemaToEditMode: {
        this.props.onLoadRegionsForSchemaEdit(() => {
          this.setState({
            editMode: true
          });
        });
        break;
      }
      case optionShemaToDisplayMode: {
        this.setState({
          editMode: false
        });
        break;
      }
      case optionShemaLoad: {
        this.props.onLoadScheme(this.props.schema.name);
        break;
      }
      case optionShemaSave: {
        this.handleSaveSchemeClick();
        break;
      }

      case optionShemaAddNode: {
        this.setState({
          openDialogAddNode: true,
          editedSchemaName: `${this.props.schema.name}(${this.props.schema.caption})`
        });
        break;
      }

      case optionShemaReset: {
        this.handleResetSchemaClick();
        break;
      }
      case optionShemaHistory: {
        if (this.props.schema) {
          window.open(`/nodeStateHistory/${this.props.schema.name}`, "_blank");
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  getNodeByName(nodeName) {
    for (let i = 0; i < this.props.nodes.length; i++) {
      let node = this.props.nodes[i];
      if (node.name === nodeName) {
        return node;
      }
    }
    return undefined;
  }

  handleDialogAddNodeClose(newParamName) {
    if (this.state.editMode) {
      console.log(newParamName);
      this.setState({ openDialogAddNode: false });

      if (newParamName !== "dismiss") {
        const node = this.getNodeByName(this.state.editedNodeName);
        if (node === undefined) {
          this.state.nodes.push(this.state.editedNodeName);
        }
      }
    }
  }

  getCenterX(node) {
    switch (node.nodeType) {
      case MyConsts.NODE_TYPE_LEP:
        return MyConsts.NODE_LEP_X_OFFSET + MyConsts.NODE_LEP_WIDTH / 2;
      case MyConsts.NODE_TYPE_PS:
        return MyConsts.NODE_PS_RADIUS;
      default:
        return 0;
    }
  }

  getCenterY(node) {
    switch (node.nodeType) {
      case MyConsts.NODE_TYPE_LEP:
        return MyConsts.NODE_LEP_Y_OFFSET + MyConsts.NODE_LEP_HEIGHT / 2;
      case MyConsts.NODE_TYPE_PS:
        return MyConsts.NODE_PS_RADIUS;
      default:
        return 0;
    }
  }

  getLines() {
    const result = [];
    if (this.props.wires) {
      for (let i = 0; i < this.props.wires.length; i += 1) {
        const locWire = this.props.wires[i];
        const locNode1 = this.props.nodes.find(
          node => node.name === locWire.nodeFrom
        );
        const locNode2 = this.props.nodes.find(
          node => node.name === locWire.nodeTo
        );
        if (locNode1 !== undefined && locNode2 !== undefined) {
          result.push({
            name: this.props.wires[i].name,
            points: [
              locNode1.x + this.getCenterX(locNode1),
              locNode1.y + this.getCenterY(locNode1),
              locNode2.x + this.getCenterX(locNode2),
              locNode2.y + this.getCenterY(locNode2)
            ]
          });
        }
      }
    }
    return result;
  }

  handleSaveSchemeClick() {
    if (this.state.editMode) {
      if (this.state.edited) {
        let nodes = [];
        this.props.nodes.forEach(node => {
          // if (node.changed !== undefined) { //currently we save all scheme due to automatic redistribution on server side.
          nodes.push({ nodeName: node.name, x: node.x, y: node.y });
          // }
        });

        if (nodes.length > 0) {
          const s = JSON.stringify(nodes);
          this.props.onSaveScheme(s);
        }
      }
    }
  }

  handleResetSchemaClick() {
    this.props.onResetSchema();
  }

  handleDragEnd(nodeObj) {
    if (this.state.editMode) {
      const locNode = this.props.nodes.find(node => node.name === nodeObj.name);
      if (locNode !== undefined) {
        // console.log(`[MyStage] Drag ends for ${locNode.name}`);

        locNode.x = nodeObj.x;
        locNode.y = nodeObj.y;
        // locNode.changed = true;
        this.setState({
          edited: true
        });
      }
    }
  }

  handleDoubleClick(nodeObj) {
    // console.log(`[MyStage] DoubleClick for ${nodeObj.name}`);
  }

  handleStageClick() {
    this.setState({
      stageClicked: true
    });
    this.setState({
      stageClicked: false
    });
  }

  render() {
    const locNodes = this.props.nodes;
    const locLines = this.getLines();
    // const locW = window.innerWidth - 30;
    // const locH = window.innerHeight - 30;
    const locW = 3000;
    const locH = 5000;

    const menuItems = this.state.editMode
      ? [
          optionShemaToDisplayMode,
          optionShemaLoad,
          optionShemaSave,
          optionShemaAddNode,
          optionShemaReset,
          optionShemaHistory
        ]
      : [optionShemaToEditMode, optionShemaLoad, optionShemaHistory];

    return (
      <div>
        <div>
          <DialogAddNode
            open={this.state.openDialogAddNode}
            onClose={this.handleDialogAddNodeClose}
            regions={this.props.regions}
            editedSchemaName={this.state.editedSchemaName}
          />
          <Stage width={locW} height={locH} onClick={this.handleStageClick}>
            <Layer>
              <MySchemaNodeMenu
                x={10}
                y={10}
                items={menuItems}
                parentStageClicked={this.state.stageClicked}
                onDragEnd={this.handleDragEnd}
                onDoubleClick={this.handleDoubleClick}
                onMenuItemSelected={this.handleMenuItemSelected}
              />

              {locNodes.map(rec => (
                <MySchemaNode
                  key={rec.name}
                  node={rec}
                  editMode={this.state.editMode}
                  parentStageClicked={this.state.stageClicked}
                  onDragEnd={this.handleDragEnd}
                  onDoubleClick={this.handleDoubleClick}
                  history={this.props.history}
                />
              ))}
              {locLines.map(line => (
                <Line
                  key={line.name}
                  points={line.points}
                  stroke="black"
                  strokeWidth={1}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
}

MyRegionSchema.propTypes = {
  schema: PropTypes.shape({
    name: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired
  }),
  regions: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  wires: PropTypes.array.isRequired,
  onLoadScheme: PropTypes.func.isRequired,
  onLoadRegionsForSchemaEdit: PropTypes.func.isRequired,
  onSaveScheme: PropTypes.func.isRequired,
  onResetSchema: PropTypes.func.isRequired,
  onSaveManualValue: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};
