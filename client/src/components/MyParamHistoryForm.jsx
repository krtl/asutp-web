import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
// import SelectField from 'material-ui/SelectField';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Moment from 'react-moment';

import Client from '../modules/Client';

const MATCHING_VALUES_LIMIT = 2500;

export default class MyParamHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      param: { name: 'Param1' },
      paramValues: [],
    };

    this.handleReloadParamValuesClick = this.handleReloadParamValuesClick.bind(this);
  }

  componentDidMount() {
    this.reloadParamValues();
  }

  handleReloadParamValuesClick() {
    this.reloadParamValues();
  }

  reloadParamValues() {
    Client.loadParamValues(this.state.param.name, (values) => {
      this.setState({
        paramValues: values.slice(0, MATCHING_VALUES_LIMIT),
      });
    });
  }

  render() {
    return (

      <div>
        <div>
          <RaisedButton onClick={this.handleReloadParamValuesClick}>Reload</RaisedButton>
        </div>
        <Table height='600px'>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>DateTime</TableHeaderColumn>
              <TableHeaderColumn>Value</TableHeaderColumn>
              <TableHeaderColumn>Quality</TableHeaderColumn>
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.state.paramValues.map(value => (
              <TableRow key={value.dt}>
                <TableRowColumn><Moment format="YYYY.MM.DD HH:mm:ss">{value.dt}</Moment></TableRowColumn>
                <TableRowColumn>{value.value}</TableRowColumn>
                <TableRowColumn>{value.qd}</TableRowColumn>
              </TableRow>))
            }
          </TableBody>
        </Table>
      </div>
    );
  }
}

MyParamHistoryForm.propTypes = {
  param: PropTypes.shape({
    name: PropTypes.string,
    caption: PropTypes.string,
    description: PropTypes.number,
  }),
  paramValues: PropTypes.arrayOf(PropTypes.shape({
    paramName: PropTypes.string,
    value: PropTypes.string,
    dt: PropTypes.string,
    qd: PropTypes.string,
  })),
};

