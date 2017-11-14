import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { formatDateTime } from '../modules/formatDateTime';
import MyIdButton from './MyIdButton';


export default class MyParams extends React.Component {
  constructor(props) {
    super(props);

    this.handleParamInfo = this.handleParamInfo.bind(this);
  }

  handleParamInfo(id) {
    this.props.router.push(`/paramInfo/${id}`);
  }

  render() {
    return (
      <Table height='300px'>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Id</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Caption</TableHeaderColumn>
            <TableHeaderColumn>Value</TableHeaderColumn>
            <TableHeaderColumn>Time</TableHeaderColumn>
            <TableHeaderColumn>Quality</TableHeaderColumn>
            <TableHeaderColumn />
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.props.params.map(param => (
            <TableRow key={param.id}>
              <TableRowColumn>{param.id}</TableRowColumn>
              <TableRowColumn>{param.name}</TableRowColumn>
              <TableRowColumn>{param.caption}</TableRowColumn>
              <TableRowColumn>{param.value}</TableRowColumn>
              <TableRowColumn>{formatDateTime(param.dt)}</TableRowColumn>
              <TableRowColumn>{formatDateTime(param.qd)}</TableRowColumn>
              <TableRowColumn>
                <MyIdButton
                  onClick={this.handleParamInfo}
                  text='Info'
                  id={param.id}
                />
              </TableRowColumn>
            </TableRow>))
          }
        </TableBody>
      </Table>
    );
  }
}

MyParams.propTypes = {
  params: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    caption: PropTypes.string,
    dt: PropTypes.string,
    qd: PropTypes.string,
  })).isRequired,
};

