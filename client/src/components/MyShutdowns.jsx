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
import { formatDateTime, timeDifference } from '../modules/formatDateTime';
import MyIdButton from './MyIdButton';

export default class MyShutdowns extends React.Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   nodes: [ ],
    // };

    this.handleShutdownInfo = this.handleShutdownInfo.bind(this);
  }

  handleShutdownInfo(id) {
    this.props.router.push(`/shutdownInfo/${id}`);
  }

  render() {
    return (
      <Table height='300px'>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Id</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Time Start</TableHeaderColumn>
            <TableHeaderColumn>Time End</TableHeaderColumn>
            <TableHeaderColumn>Time Spent</TableHeaderColumn>
            <TableHeaderColumn />
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.props.shutdowns.map(shutdown => (
            <TableRow key={shutdown.id}>
              <TableRowColumn>{shutdown.id}</TableRowColumn>
              <TableRowColumn>{shutdown.name}</TableRowColumn>
              <TableRowColumn>{formatDateTime(shutdown.timeStart)}</TableRowColumn>
              <TableRowColumn>{formatDateTime(shutdown.timeEnd)}</TableRowColumn>
              <TableRowColumn>{
                timeDifference(shutdown.timeEnd, shutdown.timeStart)}
              </TableRowColumn>
              <TableRowColumn>
                <MyIdButton
                  onClick={this.handleShutdownInfo}
                  text='Info'
                  id={shutdown.id}
                />
              </TableRowColumn>
            </TableRow>))
          }
        </TableBody>
      </Table>
    );
  }
}

MyShutdowns.propTypes = {
  shutdowns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    timeStart: PropTypes.string,
    timeEnd: PropTypes.string,
  })).isRequired,
};

