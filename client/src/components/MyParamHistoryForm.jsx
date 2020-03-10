import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "material-ui/Tabs";
import RaisedButton from "material-ui/RaisedButton";
// import SelectField from 'material-ui/SelectField';

import TextField from "@material-ui/core/TextField";

import { Card, CardText } from "material-ui/Card";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import TablePagination from '@material-ui/core/TablePagination';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import Moment from "react-moment";

import { formatDateTime } from "../modules/formatDateTime";

const styles = {
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 200
  }
};

export default class MyParamHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    let yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);

    this.state = {
      dt: formatDateTime(yesterday)
    };

    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleReloadParamValuesClick = this.handleReloadParamValuesClick.bind(
      this
    );
  }

  componentDidMount() {
    this.props.onReloadParamValues(this.props.paramName, this.state.dt);
  }

  handleReloadParamValuesClick() {
    this.props.onReloadParamValues(this.props.paramName, this.state.dt);
  }

  handleDateTimeChange(event) {
    this.setState({ dt: event.target.value });
  }

  render() {
    const data = [];

    this.props.paramValues.forEach(vl => {
      data.push({
        value: vl.value,
        dt: vl.dt // dt currently not works.
      });
    });

    return (
      <Card className="container">
        <div>
          <CardText>{this.props.paramName}</CardText>
          <TextField
            id="datetime-local"
            type="datetime-local"
            required
            defaultValue={this.state.dt}
            className={styles.textField}
            InputLabelProps={{
              shrink: true
            }}
            inputProps={{
              step: 1
            }}
            onChange={this.handleDateTimeChange}
          />
          <RaisedButton onClick={this.handleReloadParamValuesClick}>
            Reload
          </RaisedButton>
        </div>

        <Tabs>
          <Tab label="Table">
            <TableContainer>
              <Table size="small" padding="none">
                <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableCell>DateTime</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Quality</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody displayRowCheckbox={false}>
                  {this.props.paramValues.map(value => (
                    <TableRow key={value.dt} style={styles.cellCustomHeight}>
                      <TableCell>
                        <Moment format="YYYY.MM.DD HH:mm:ss">{value.dt}</Moment>
                      </TableCell>
                      <TableCell>{value.value}</TableCell>
                      <TableCell>{value.qd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Tab>
          <Tab label="Chart">
            <LineChart
              width={1200}
              height={600}
              data={data}
              margin={{
                top: 70,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <XAxis dataKey="dt" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </Tab>
        </Tabs>
      </Card>
    );
  }
}

MyParamHistoryForm.propTypes = {
  paramName: PropTypes.string,
  paramValues: PropTypes.arrayOf(
    PropTypes.shape({
      paramName: PropTypes.string,
      value: PropTypes.number,
      dt: PropTypes.string,
      qd: PropTypes.string
    })
  ),
  onReloadParamValues: PropTypes.func
};
