import React from "react";
import PropTypes from "prop-types";
import Dialog from "material-ui/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";
import Typography from "@material-ui/core/Typography";

const styles = {
  radioButton: {
    marginTop: 6
  }
};

export default class MyParamDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
      newManualValue: props.initialParamValue,
      newBlockRawValues: props.initialBlockRawValues
    };

    this.handleOk = this.handleOk.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleManualValueChange = this.handleManualValueChange.bind(this);
    this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      this.setState({ open: this.props.open });
      if (this.props.open) {
        this.setState({ newManualValue: this.props.initialParamValue });
        this.setState({ newBlockRawValues: this.props.initialBlockRawValues });
      }
    }
  }

  handleClose() {
    this.setState({ open: false });
    this.props.onClose("dismiss");
  }

  handleOk() {
    this.setState({ open: false });
    this.props.onClose({
      newManualValue: this.state.newManualValue,
      newBlockRawValues: this.state.newBlockRawValues
    });
  }

  handleManualValueChange(event, newValue) {
    this.setState({ newManualValue: newValue });
  }

  handleRadioGroupChange(event, newValue) {
    this.setState({ newBlockRawValues: newValue });
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleClose} />,
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleOk}
      />
    ];

    const radios = [];

    radios.push(
      <RadioButton
        key={0}
        value={"unblocked"}
        label={"unblocked"}
        style={styles.radioButton}
      />
    );
    radios.push(
      <RadioButton
        key={1}
        value={"blocked"}
        label={"blocked"}
        style={styles.radioButton}
      />
    );

    return (
      <Dialog
        // title={`Manual value for param: '${this.props.editedNodeName}'`}

        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
        autoScrollBodyContent={true}
      >
        <DialogTitle align="center">{"Manual value for param:"}</DialogTitle>
        <Typography variant="subtitle2" align="center">
          {this.props.editedNodeName}
        </Typography>
        <Typography variant="h6" color="primary" align="center">
          {this.props.editedNodeCaption}
        </Typography>
        <Typography
          paragraph
          variant="subtitle2"
          color="secondary"
          align="center"
        >
          {this.props.editedParamName}
        </Typography>

        {/* <DialogContent> */}
        <Grid container spacing={5} alignItems="center" justify="center">
          <Grid item>
            <TextField
              floatingLabelText="Manual Value:"
              name="ManualValue"
              type="number"
              // autoFocus
              // margin="dense"
              // id="manualValue"
              // label="manualValue"
              // fullWidth
              onChange={this.handleManualValueChange}
              value={this.state.newManualValue}
            />
          </Grid>
          <Grid item>
            <RadioButtonGroup
              name="blocking"
              defaultSelected={this.props.initialBlockRawValues}
              onChange={this.handleRadioGroupChange}
            >
              {radios}
            </RadioButtonGroup>
          </Grid>
        </Grid>
      </Dialog>
    );
  }
}

MyParamDialog.propTypes = {
  onClose: PropTypes.func,
  initialParamValue: PropTypes.number,
  initialBlockRawValues: PropTypes.string,
  editedNodeName: PropTypes.string,
  editedNodeCaption: PropTypes.string,
  editedParamName: PropTypes.string
};
