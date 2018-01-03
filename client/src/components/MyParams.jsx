import React from 'react';
// import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
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

import MyIdButton from './MyIdButton';
// import Client from '../modules/Client';

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
    this.handleParamInfo = this.handleParamInfo.bind(this);
    this.handleLoadParamsClick = this.handleLoadParamsClick.bind(this);
  }

  componentDidMount() {
    MyStompClient.loadParamLists((paramLists) => {
      this.setState({
        paramLists: paramLists.slice(0, MATCHING_LISTS_LIMIT),
      });
    });
  }

  handleLoadParamsClick() {
    MyStompClient.loadParams(this.state.selectedParamList.name, (params) => {
      this.setState({
        params: params.slice(0, MATCHING_PARAMS_LIMIT),
      });
    });

    const locThis = this;  // should be remaked!

    MyStompClient.subscribeToValues(this.state.selectedParamList.name, (value) => {
      const locParams = locThis.state.params.slice();
      let b = false;
      for (let i = 0; i < locParams.length; i++) {
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

  handleParamInfo(id) {
    this.props.router.push(`/paramInfo/${id}`);
  }

  handleChange(event, index, value) {
    this.setState({ selectedParamList: value });
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
              <MenuItem key={paramList.name} value={paramList} primaryText={paramList.name} secondaryText={paramList.name} />
            ))
            }
          </SelectField>
          <RaisedButton onClick={this.handleLoadParamsClick}>Load</RaisedButton>
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
                <TableRowColumn><Moment>{param.dt}</Moment></TableRowColumn>
                <TableRowColumn>{param.qd}</TableRowColumn>
                <TableRowColumn>
                  <MyIdButton
                    onClick={this.handleParamInfo}
                    text='Info'
                    id={param.name}
                  />
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

