import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import {MyConsts} from '../modules/MyConsts';



const styles = {
  radioButton: {
    marginTop: 6,
  },
};

    
export default class MyPSAsutpLinkageDialog extends React.Component {
  constructor(props) {
    super(props);
       this.state = {
            open: props.open,
            newParamName: '',
          };

    this.handleOk = this.handleOk.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this);
  }
      
  componentDidUpdate(prevProps){
    if (this.props.open !== prevProps.open) {
      this.setState({open: this.props.open});
      if (this.props.open) {
        this.setState({newParamName: this.props.initialParamName}); 
      }
    }
  }

  handleClose () {
    this.setState({open: false});
    this.props.onClose('dismiss');
  }   
  
  handleOk () {
    this.setState({open: false});
    this.props.onClose(this.state.newParamName);
  } 

  handleRadioGroupChange(event, newValue) {
    this.setState({newParamName: newValue});
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
      
    const radios = [];

    radios.push(
      <RadioButton
        key={0}
        value={''}
        label={'none'}
        style={styles.radioButton}
      />
    )

    this.props.asutpConnections.forEach(element => {
      let locParamName = '';

      switch (this.props.paramRole){
        case MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER: {
          locParamName = element.PParamName;
          break;
        }
        case MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE: {
          // locParamName = element.UParamName;
          break;
        }
        case MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE: {
          locParamName = element.VVParamName;
          break;
        }
        default: locParamName = '';
      }

      if (locParamName !== '') {
        radios.push(
          <RadioButton
            key={element._id}
            value={locParamName}
            label={`${locParamName} (${element.caption})`}
            style={styles.radioButton}
          />
        )
      }
    });

    return (
        <Dialog
          title={`Link ASUTP param for '${this.props.editedNodeName}'`}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
          <RadioButtonGroup 
            name="shipSpeed"
            defaultSelected={this.props.initialParamName}
            onChange={this.handleRadioGroupChange}
            >
            {radios}
          </RadioButtonGroup>
        </Dialog>
        );
  }
}
      
MyPSAsutpLinkageDialog.propTypes = {
  onClose: PropTypes.func,
  asutpConnections: PropTypes.array,
  paramRole: PropTypes.string,
  initialParamName: PropTypes.string,
  editedNodeName: PropTypes.string,
};
      