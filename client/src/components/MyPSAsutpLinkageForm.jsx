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

    this.handleReloadPSClick = this.handleReloadPSClick.bind(this);
  }

  componentDidMount() {
    this.props.onReloadPS(this.props.psName, true);
  }

  handleReloadPSClick() {
    this.props.onReloadPS(this.props.psName, false);
  }

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
            section.connectors.forEach(connector => {
                rows.push({name: connector.name,
                 caption: connector.caption,
                 nodeType: connector.nodeType,
                 sapCode: connector.sapCode
                })
                rows.push({name: connector.name + '.paramP',
                    caption: connector.paramP,
                    nodeType: '',
                    sapCode: ''
                   })   
                connector.equipments.forEach(equipment => {
                    rows.push({name: equipment.name,
                     caption: equipment.caption,
                     nodeType: equipment.nodeType,
                     sapCode: equipment.sapCode
                    })
                    rows.push({name: equipment.name + '.paramState',
                    caption: equipment.paramState,
                    nodeType: '',
                    sapCode: ''
                   })   

                });
            });
          });
         });
        }
                

    return (
      
      <Card className='container'>
        <div>
          <CardText>{this.props.psName}</CardText>
          <RaisedButton onClick={this.handleReloadPSClick}>Reload</RaisedButton>
        </div>
        <div>

          {/* <CardText>{this.props.PS}</CardText> */}
          <Table height='600px'>
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
                  <TableRow key={row.name} style={styles.cellCustomHeight}>
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
         
      </Card>
    );
  }
}

 MyPSAsutpLinkageForm.propTypes = {
  psName: PropTypes.string,
  PS: PropTypes.object,
  onReloadPS: PropTypes.func,
 };



