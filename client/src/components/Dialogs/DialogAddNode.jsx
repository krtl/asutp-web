import React from "react";
import PropTypes from "prop-types";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

const styles = {
  radioButton: {
    marginTop: 6
  },
  formControl: {
    margin: 1,
    minWidth: 120,
    maxWidth: 300
  }
};

export default class DialogAddNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
      currentRegionName: "",
      currentRegion: undefined,
      currentNodes: [],
      newNodeName: ""
    };

    this.handleOk = this.handleOk.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleNodeChange = this.handleNodeChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      this.setState({ open: this.props.open });
      if (this.props.open) {
        this.setState({ newNodeName: "" });
      }
    }
  }

  handleClose() {
    this.setState({ open: false });
    this.props.onClose("dismiss");
  }

  handleOk() {
    this.setState({ open: false });
    this.props.onClose(this.state.newNodeName);
  }

  handleRadioGroupChange(event, newValue) {
    this.setState({ newParamName: newValue });
  }

  handleRegionChange = event => {
    console.log("region change");
    this.setState({
      currentRegion: event.target.value.name,
      currentNodes: event.target.value.nodes,
      newNodeName: ""
    });
  };

  handleNodeChange = event => {
    console.log("node change");
    this.setState({
      newNodeName: event.target.value
    });
  };

  render() {
    console.log("render");

    const regionItems = [];
    const nodeItems = [];

    regionItems.push(
      <MenuItem key={0} value={undefined} style={styles.radioButton}>
        {"none"}
      </MenuItem>
    );

    this.props.regions.forEach(region => {
      regionItems.push(
        <MenuItem key={region.name} value={region}>
          {region.name}
        </MenuItem>
      );
    });

    nodeItems.push(
      <MenuItem key={0} value={undefined} style={styles.radioButton}>
        {"none"}
      </MenuItem>
    );

    this.state.currentNodes.forEach(node => {
      regionItems.push(
        <MenuItem key={node.name} value={node}>
          {node.name}
        </MenuItem>
      );
    });

    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleClose} />,
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleOk}
      />
    ];

    return (
      <Dialog
        title={`Add node for '${this.props.editedSchemaName}'`}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
        autoScrollBodyContent={true}
      >
        <FormControl>
          <Select
            value={this.state.currentRegionName}
            onChange={this.handleRegionChange}
            // displayEmpty
          >
            {regionItems}
          </Select>
        </FormControl>

        <FormControl>
          <Select
            value={this.state.newNodeName}
            onChange={this.handleNodeChange}
            displayEmpty
          >
            {nodeItems}
          </Select>
        </FormControl>
      </Dialog>
    );
  }
}

DialogAddNode.propTypes = {
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      caption: PropTypes.string.isRequired,
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          caption: PropTypes.string.isRequired
        }).isRequired
      )
    })
  ).isRequired,
  onClose: PropTypes.func,
  editedSchemaName: PropTypes.string
};
