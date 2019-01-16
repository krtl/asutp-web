import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
// import SelectField from 'material-ui/SelectField';
import { Card, CardText } from 'material-ui/Card';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Moment from 'react-moment';
// import moment from 'moment';
import { connect } from 'react-redux';
import {
  loadingBegin,
  loadingEnd
} from '../reducers/actions'

import Client from '../modules/Client';

const MATCHING_VALUES_LIMIT = 2500;

const styles = {
  cellCustomHeight: {
    height: 12,
  }
};



class MyParamHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paramName: '',
      paramValues: [],
    };

    this.handleReloadParamValuesClick = this.handleReloadParamValuesClick.bind(this);
    this.handleReloadParamHalfHourValuesClick = this.handleReloadParamHalfHourValuesClick.bind(this);
  }

  componentDidMount() {
    this.reloadParamValues(true);
  }

  handleReloadParamValuesClick() {
    this.reloadParamValues(false);
  }

  handleReloadParamHalfHourValuesClick() {
    this.reloadParamValues(true);
  }
  
  reloadParamValues(useHalfHourValues) {
    const historyParamName = window.location.href.slice(window.location.href.lastIndexOf('/') + 1);

    this.setState({
      paramName: historyParamName,
    });

    this.props.onLoadingStart();


    Client.loadParamValues(historyParamName, useHalfHourValues, (values) => {
      this.setState({
        paramValues: values.slice(0, MATCHING_VALUES_LIMIT),
      });
      this.props.onLoadingEnd();
    });
  }


  render() {
    const data = [
      {
        value: 0,
        dt: 0,
      },
    ];

    this.state.paramValues.forEach((vl) => {
      data.push(
        {
          value: vl.value,
          dt: vl.dt,  // dt currently not works.
        },
      );
    });


    return (
      
      <Card className='container'>
        <div>
          <CardText>{this.state.paramName}</CardText>
          <RaisedButton onClick={this.handleReloadParamValuesClick}>Reload</RaisedButton>
          <RaisedButton onClick={this.handleReloadParamHalfHourValuesClick}>HalfHour</RaisedButton>
        </div>

        <Tabs>
          <Tab label='Table' >
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
                  <TableRow key={value.dt} style={styles.cellCustomHeight}>
                    <TableRowColumn style={styles.cellCustomHeight}><Moment format='YYYY.MM.DD HH:mm:ss'>{value.dt}</Moment></TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>{value.value}</TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>{value.qd}</TableRowColumn>
                  </TableRow>))
                }
              </TableBody>
            </Table>
          </Tab>
          <Tab label='Chart' >
            <LineChart
              width={1200}
              height={600}
              data={data}
              margin={{
                top: 70, right: 30, left: 20, bottom: 5,
              }}
            >
              <XAxis dataKey='dt' />
              <YAxis />
              <CartesianGrid strokeDasharray='3 3' />
              <Tooltip />
              <Legend />
              <Line type='monotone' dataKey='value' stroke='#8884d8' />
            </LineChart>
          </Tab>
        </Tabs>
      </Card>
    );
  }
}


 MyParamHistoryForm.propTypes = {
  onLoadingStart: PropTypes.func.isRequired,
  onLoadingEnd: PropTypes.func.isRequired,   
//   paramValues: PropTypes.arrayOf(PropTypes.shape({
//     paramName: PropTypes.string,
//     value: PropTypes.string,
//     dt: PropTypes.string,
//     qd: PropTypes.string,
//   })),
 };


export default connect(null,
  dispatch => ({
    onLoadingStart: (payload) => {
      dispatch(loadingBegin(payload));      
    },
    onLoadingEnd: (payload) => {
      dispatch(loadingEnd(payload));
    },
  }),
)(MyParamHistoryForm);
