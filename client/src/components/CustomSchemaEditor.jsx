import React from "react";
import PropTypes from "prop-types";
import { Layer, Stage, Line } from "react-konva";
import MySchemaNode from "./SchemaElements/MySchemaNode";
import MySchemaNodeMenu from "./SchemaElements/MySchemaNodeMenu";
import DialogAddNode from "./Dialogs/DialogAddNode";
import { MyConsts } from "../modules/MyConsts";

const optionShemaAddNode = "AddNode";
const optionShemaLoad = "Reload";
const optionShemaSave = "Save";
const optionShemaReset = "Reset";

export default class CustomSchemaEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited: false,
      stateChanged: false,
      stageClicked: false,

      open: false,
      editedSchemaName: "",
      regions: [],
      nodes: []
    };
    this.handleLoadSchemeClick = this.handleLoadSchemeClick.bind(this);
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleResetSchemaClick = this.handleResetSchemaClick.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);

    this.handleMenuItemSelected = this.handleMenuItemSelected.bind(this);
    this.handleStageClick = this.handleStageClick.bind(this);

    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  handleMenuItemSelected(option) {
    // console.log(option);
    switch (option) {
      case optionShemaAddNode: {
        this.setState({
          open: true,
          editedSchemaName: "schema_Name!"
        });

        break;
      }
      case optionShemaLoad: {
        this.handleLoadSchemeClick();
        break;
      }
      case optionShemaSave: {
        this.handleSaveSchemeClick();
        break;
      }
      case optionShemaReset: {
        this.handleResetSchemaClick();
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

  handleDialogClose(newParamName) {
    this.setState({ open: false });

    if (newParamName !== "dismiss") {
      const node = this.getNodeByName(this.state.editedNodeName);
      if (node === undefined) {
        this.state.nodes.push(this.state.editedNodeName);
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

  doLoadScheme(selectedRegion) {
    if (selectedRegion === undefined) {
      selectedRegion = this.state.selectedRegion;
    }

    if (selectedRegion) {
      this.props.onLoadScheme(selectedRegion.name);
    }
  }

  handleLoadSchemeClick(selectedListItem) {
    this.doLoadScheme(this.state.selectedRegion);
  }

  handleRegionChange(event, index, value) {
    this.setState({ selectedRegion: value });
    this.doLoadScheme(value);
  }

  handleSaveSchemeClick() {
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

  handleResetSchemaClick() {
    this.props.onResetSchema();
  }

  handleDragEnd(nodeObj) {
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

    return (
      <div>
        <div></div>
        <div>
          <DialogAddNode
            open={this.state.open}
            onClose={this.handleDialogClose}
            regions={this.props.regions}
            editedSchemaName={this.state.editedSchemaName}
          />
          <Stage width={locW} height={locH} onClick={this.handleStageClick}>
            <Layer>
              <MySchemaNodeMenu
                x={10}
                y={10}
                items={[
                  optionShemaAddNode,
                  optionShemaLoad,
                  optionShemaSave,
                  optionShemaReset
                ]}
                parentStageClicked={this.state.stageClicked}
                onDragEnd={this.handleDragEnd}
                onDoubleClick={this.handleDoubleClick}
                onMenuItemSelected={this.handleMenuItemSelected}
              />

              {locNodes.map(rec => (
                <MySchemaNode
                  key={rec.name}
                  node={rec}
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

CustomSchemaEditor.propTypes = {
  schemaName: PropTypes.string,
  schema: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    caption: PropTypes.string,
    description: PropTypes.string
  }),
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      caption: PropTypes.string.isRequired,
      nodes: PropTypes.array.isRequired
    })
  ).isRequired,
  nodes: PropTypes.array.isRequired,
  wires: PropTypes.array.isRequired,
  onLoadScheme: PropTypes.func.isRequired,
  onSaveScheme: PropTypes.func.isRequired,
  onResetSchema: PropTypes.func.isRequired,
  onAddNode: PropTypes.func.isRequired,
  onDeleteNode: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};
