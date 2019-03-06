import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText } from 'material-ui/Card';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
  } from 'material-ui/Table';
import MyPSAsutpLinkageDialog from './MyPSAsutpLinkageDialog'
import {MyConsts} from '../modules/MyConsts';


  const styles = {
    customWidth: {
      width: 750,
    },
    cellCustomHeight: {
      height: 12,
    },
    cellCustomSize1: {
      height: 12,
      width: '30%',
    },
    cellCustomSize2: {
      height: 12,
      width: '50%',
    },
    cellCustomSize3: {
      height: 12,
      width: '10%',
    },
    cellCustomSize4: {
      height: 12,
      width: '10%',
    }  
  };

 

export default class MyPSAsutpLinkageForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        open: false,
        paramRole: '',
        initialParamName: '',
        editedNodeName: '',
      };
    
    this.handleReloadPSClick = this.handleReloadPSClick.bind(this);
    this.handleSavePSLinkageClick = this.handleSavePSLinkageClick.bind(this);
    // this.handleRowDblClick = this.handleRowDblClick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  componentDidMount() {
    this.props.onReloadPS(this.props.psName, true);
  }

  handleReloadPSClick() {
    this.props.onReloadPS(this.props.psName, false);
  }

  handleSavePSLinkageClick() {
    let linkages = [];
    if (this.props.PS) {
      for(let i=0; i<this.props.PS.psparts.length; i++) {
        let pspart = this.props.PS.psparts[i];
        for(let j=0; j<pspart.sections.length; j++) {
          let section = pspart.sections[j];
          if(('Modified' in section)) {
            linkages.push({
               nodeName: section.name,
               paramPropName: MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE,
               paramPropValue: section[MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE]
              });
            delete section['Modified'];
          }
          for(let k=0; k<section.connectors.length; k++) {
            let connector = section.connectors[k];
            if(('Modified' in connector)) {
              linkages.push({
                 nodeName: connector.name,
                 paramPropName: MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER,
                 paramPropValue: connector[MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER]
                });
              delete connector['Modified'];
            }
            for(let l=0; l<connector.equipments.length; l++) {
              let equipment = connector.equipments[l] 
              if(('Modified' in equipment)) {
                linkages.push({
                  nodeName: equipment.name,
                  paramPropName: MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE,
                  paramPropValue: equipment[MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE]
                 });
                 delete equipment['Modified'];
                }
            }
          }
        }
      }
    }
    
    let s = JSON.stringify(linkages);    
    this.props.onSavePSLinkage(this.props.psName, s);
  }

  handleRowDblClick(param, val) {
    let role = '';
    let nodeName = '';
    if (param.name.endsWith(MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER)) {
      role = MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER;
      nodeName = param.name.replace('.' + MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER, '');
    } else if (param.name.endsWith(MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE)) {
      role = MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE
      nodeName = param.name.replace('.' + MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE, '');
    } else if (param.name.endsWith(MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE)) {
      role = MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE
      nodeName = param.name.replace('.' + MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE, '');
    }

    if (role !== '') {
      this.setState({ 
        open: true,
        paramRole: role,
        initialParamName: param.caption, // this is a temporary solution
        editedNodeName: nodeName,
       });
    }
  }

  getNodeByName(nodeName) {
    if (this.props.PS) {
      for(let i=0; i<this.props.PS.psparts.length; i++) {
        let pspart = this.props.PS.psparts[i];
        for(let j=0; j<pspart.sections.length; j++) {
          let section = pspart.sections[j];
          for(let k=0; k<section.connectors.length; k++) {
            let connector = section.connectors[k];
            if(connector.name === nodeName) {
               return connector;
            }
            for(let l=0; l<connector.equipments.length; l++) {
              let equipment = connector.equipments[l] 
              if(equipment.name === nodeName) {
                return equipment;
              }
            }
          }
        }
      }
    }
    return null;    
  }

  handleDialogClose (newParamName) {
    this.setState({ open: false });

    const node = this.getNodeByName(this.state.editedNodeName)
    if (node) {
      if (this.state.paramRole in node){
        if (node[this.state.paramRole] !== newParamName) {
          node[this.state.paramRole] = newParamName;
          node['Modified'] = true;
          }
      }
    }
  };

  render() {

    let rows = [];
    if (this.props.PS) {
        this.props.PS.psparts.forEach(pspart => {
           rows.push({name: pspart.name,
            caption: pspart.caption,
            nodeType: pspart.nodeType,
            sapCode: pspart.sapCode
           })
           pspart.sections.forEach(section => {
            rows.push({name: section.name,
             caption: section.caption,
             nodeType: section.nodeType,
             sapCode: section.sapCode
            })
            rows.push({name: section.name + '.' + MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE, 
            caption: section[MyConsts.NODE_PRPNAME_PARAM_ROLE_VOLTAGE],
            nodeType: ('Modified' in section) ? 'Modified' : '',
            sapCode: ''
           })   
            section.connectors.forEach(connector => {
                rows.push({name: connector.name,
                 caption: connector.caption,
                 nodeType: connector.nodeType,
                 sapCode: connector.sapCode
                })
                rows.push({name: connector.name + '.' + MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER, 
                    caption: connector[MyConsts.NODE_PRPNAME_PARAM_ROLE_POWER],
                    nodeType: ('Modified' in connector) ? 'Modified' : '',
                    sapCode: ''
                   })   
                connector.equipments.forEach(equipment => {
                    rows.push({name: equipment.name,
                     caption: equipment.caption,
                     nodeType: equipment.nodeType,
                     sapCode: equipment.sapCode
                    })
                    rows.push({name: equipment.name + '.' + MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE,
                    caption: equipment[MyConsts.NODE_PRPNAME_PARAM_ROLE_STATE],
                    nodeType: ('Modified' in equipment) ? 'Modified' : '',
                    sapCode: ''
                   })
                });
            });
          });
         });
        }
         
        rows.sort((row1, row2) => {
          if (row1.name > row2.name) {
            return 1;
          }
          if (row1.name < row2.name) {
            return -1;
          }
          return 0;
        }
      );

                
        let psCaption = this.props.psName;
        if (this.props.PS) {  
          psCaption += ` (${this.props.PS.caption})`;
        }      

    return (
      
      <Card className='container'>
        <div>
          <CardText>{psCaption}</CardText>
          <RaisedButton onClick={this.handleReloadPSClick}>Reload</RaisedButton>
          <RaisedButton onClick={this.handleSavePSLinkageClick}>Save</RaisedButton>
        </div>
        <div>
          {/* <CardText>{this.props.PS}</CardText> */}
          <Table height='1000px'>
              <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Caption</TableHeaderColumn>
                  <TableHeaderColumn>Type</TableHeaderColumn>
                  <TableHeaderColumn>sapCode</TableHeaderColumn>
                  <TableHeaderColumn />
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {rows.map(row => (
                  <TableRow key={row.name} style={styles.cellCustomHeight} onDoubleClick={this.handleRowDblClick.bind(this, row)} >
                    <TableRowColumn style={styles.cellCustomHeight}>{row.name}</TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>{row.caption}</TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>{row.nodeType}</TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>{row.sapCode}</TableRowColumn>
                  </TableRow>
                  ))
                }
              </TableBody>
            </Table>
        </div>
        <MyPSAsutpLinkageDialog
                open={this.state.open}
                onClose={this.handleDialogClose}
                asutpConnections={this.props.asutpConnections}
                paramRole={this.state.paramRole}
                initialParamName={this.state.initialParamName}
                editedNodeName={this.state.editedNodeName}
          />         
      </Card>
    );
  }
}

 MyPSAsutpLinkageForm.propTypes = {
  psName: PropTypes.string,
  PS: PropTypes.object,
  asutpConnections: PropTypes.array,
  onReloadPS: PropTypes.func,
  onSavePSLinkage: PropTypes.func,
 };



