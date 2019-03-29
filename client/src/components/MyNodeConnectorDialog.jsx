import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';


const styles = {
  radioButton: {
    marginTop: 6,
  },
};

    
export default class MyNodeConectorDialog extends React.Component {
  constructor(props) {
    super(props);
       this.state = {
            open: props.open,
            newManualValue: props.initialParamValue,
            newBlockRawValues: props.initialBlockRawValues,
          };

    this.handleOk = this.handleOk.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleManualValueChange = this.handleManualValueChange.bind(this);
    this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this);
  }
      
  componentDidUpdate(prevProps){
    if (this.props.open !== prevProps.open) {
      this.setState({open: this.props.open});
      if (this.props.open) {
        this.setState({newManualValue: this.props.initialParamValue});
        this.setState({newBlockRawValues: this.props.initialBlockRawValues});
      }
    }
  }

  handleClose () {
    this.setState({open: false});
    this.props.onClose('dismiss');
  }   
  
  handleOk () {
    this.setState({open: false});
    this.props.onClose({ newManualValue: this.state.newManualValue, newBlockRawValues: this.state.newBlockRawValues });
  }
  
  handleManualValueChange(event, newValue) {
    this.setState({newManualValue: newValue});
  }

  handleRadioGroupChange(event, newValue) {
    this.setState({newBlockRawValues: newValue});
  }
  
  render() {
    const actions = [
            <FlatButton
              label="Cancel"
              primary={true}
              onClick={this.handleClose}
            />,
            <FlatButton
              label="Ok"
              primary={true}
              keyboardFocused={true}
              onClick={this.handleOk}
            />,
          ];          
      
          const radiosBlocking = [];

          radiosBlocking.push(
            <RadioButton
              key={0}
              value={'unblocked'}
              label={'unblocked'}
              style={styles.radioButton}
            />
          )          
          radiosBlocking.push(
            <RadioButton
              key={1}
              value={'blocked'}
              label={'blocked'}
              style={styles.radioButton}
            />
          )     
          
          const radiosValue = [];

          radiosValue.push(
            <RadioButton
              key={0}
              value={0}
              label={'off'}
              style={styles.radioButton}
            />
          )          
          radiosValue.push(
            <RadioButton
              key={1}
              value={1}
              label={'on'}
              style={styles.radioButton}
            />
          )           


    return (
        <Dialog
          title={`Manual value for param: '${this.props.editedNodeName}'`}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
        {/* <DialogContent> */}

          <RadioButtonGroup 
            name="value"
            defaultSelected={this.props.initialParamValue}
            onChange={this.handleManualValueChange}
            >
            {radiosValue}
          </RadioButtonGroup>          

          <RadioButtonGroup 
            name="blocking"
            defaultSelected={this.props.initialBlockRawValues}
            onChange={this.handleRadioGroupChange}
            >
            {radiosBlocking}
          </RadioButtonGroup>
        </Dialog>
        );
  }
}
      
MyNodeConectorDialog.propTypes = {
  onClose: PropTypes.func,
  initialParamValue: PropTypes.number,
  initialBlockRawValues: PropTypes.string,
  editedNodeName: PropTypes.string,
};
      