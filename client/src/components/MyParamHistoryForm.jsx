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


const styles = {
  cellCustomHeight: {
    height: 12,
  }
};


export default class MyParamHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleReloadParamValuesClick = this.handleReloadParamValuesClick.bind(this);
  }

  componentDidMount() {
    this.props.onReloadParamValues(this.props.paramName);
  }

  handleReloadParamValuesClick() {
    this.props.onReloadParamValues(this.props.paramName);
  }

 

  render() {
    const data = [      
    ];

    this.props.paramValues.forEach((vl) => {
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
          <CardText>{this.props.paramName}</CardText>
          <RaisedButton onClick={this.handleReloadParamValuesClick}>Reload</RaisedButton>
        </div>

        <Tabs>
          <Tab label='Table' >
            <Table height='1000px'>
              <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableHeaderColumn>DateTime</TableHeaderColumn>
                  <TableHeaderColumn>Value</TableHeaderColumn>
                  <TableHeaderColumn>Quality</TableHeaderColumn>
                  <TableHeaderColumn />
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {this.props.paramValues.map(value => (
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
  paramName: PropTypes.string,
  paramValues: PropTypes.arrayOf(PropTypes.shape({
     paramName: PropTypes.string,
     value: PropTypes.number,
     dt: PropTypes.string,
     qd: PropTypes.string,
   })),
   onReloadParamValues: PropTypes.func,
 };



