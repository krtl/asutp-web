import React from 'react';
import { Link } from 'react-router';
// import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import MenuItem from 'material-ui/MenuItem';
import Moment from 'react-moment';

/* global localStorage */

import MyStompClient from '../modules/MyStompClient';

const styles = {
  customWidth: {
    width: 750,
  },
};

const MATCHING_PARAMS_LIMIT = 2500;
const MATCHING_LISTS_LIMIT = 1000;

export default class MyParams extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedParamList: '',
      paramLists: [],
      params: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLoadParamsClick = this.handleLoadParamsClick.bind(this);
  }

  componentDidMount() {
    MyStompClient.loadParamLists((paramLists) => {
      this.setState({
        paramLists: paramLists.slice(0, MATCHING_LISTS_LIMIT),
      });

      const selectedParamListName = localStorage.getItem('selectedParamList');
      if (selectedParamListName) {
        for (let i = 0; i < this.state.paramLists.length; i += 1) {
          if (this.state.paramLists[i].name === selectedParamListName) {
            this.setState({
              selectedParamList: this.state.paramLists[i],
            });
            this.handleLoadParamsClick();
            break;
          }
        }
      }
    });
  }

  componentWillUnmount() {
    MyStompClient.unsubscribeFromValues();
  }

  handleLoadParamsClick() {
    MyStompClient.loadParams(this.state.selectedParamList.name, (params) => {
      this.setState({
        params: params.slice(0, MATCHING_PARAMS_LIMIT),
      });

      localStorage.setItem('selectedParamList', this.state.selectedParamList.name);
    });

    const locThis = this;  // should be rewritten!

    MyStompClient.subscribeToValues(this.state.selectedParamList.name, (value) => {
      const locParams = locThis.state.params.slice();
      let b = false;
      for (let i = 0; i < locParams.length; i += 1) {
        const locParam = locParams[i];
        if (locParam.name === value.paramName) {
          locParam.value = value.value;
          locParam.dt = value.dt;
          locParam.qd = value.qd;
          b = true;
          break;
        }
      }
      if (b) {
        this.setState({
          params: locParams,
        });
      }
    });
  }

  handleChange(event, index, value) {
    this.setState({ selectedParamList: value });

    this.handleLoadParamsClick();
  }

  render() {
    return (

      <div>
        <div>
          <SelectField
            floatingLabelText='Params List:'
            value={this.state.selectedParamList}
            onChange={this.handleChange}
            style={styles.customWidth}
          >
            {this.state.paramLists.map(paramList => (
              <MenuItem key={paramList.name} value={paramList} primaryText={paramList.caption} secondaryText={paramList.name} />
            ))
            }
          </SelectField>
        </div>
        <Table height='600px'>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Caption</TableHeaderColumn>
              <TableHeaderColumn>Value</TableHeaderColumn>
              <TableHeaderColumn>Time</TableHeaderColumn>
              <TableHeaderColumn>Quality</TableHeaderColumn>
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.state.params.map(param => (
              <TableRow key={param.name}>
                <TableRowColumn>{param.name}</TableRowColumn>
                <TableRowColumn>{param.caption}</TableRowColumn>
                <TableRowColumn>{param.value}</TableRowColumn>
                <TableRowColumn><Moment format='YYYY.MM.DD HH:mm:ss'>{param.dt}</Moment></TableRowColumn>
                <TableRowColumn>{param.qd}</TableRowColumn>
                <TableRowColumn>
                  <Link to={`/paramHistory/${param.name}`}>History</Link>
                </TableRowColumn>
              </TableRow>))
          }
          </TableBody>
        </Table>
      </div>
    );
  }
}

// MyParams.propTypes = {
// };

