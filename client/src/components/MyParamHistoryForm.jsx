import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "material-ui/Tabs";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import Moment from "react-moment";
import moment from "moment";

import DateFnsUtils from "@date-io/date-fns";

const styles = {
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 200,
  },
};

export default class MyParamHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    let yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);
    let tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    this.state = {
      fromDt: yesterday,
      toDt: tomorrow,
    };

    this.handleFromDateTimeChange = this.handleFromDateTimeChange.bind(this);
    this.handleToDateTimeChange = this.handleToDateTimeChange.bind(this);
    this.handleReloadParamValuesClick = this.handleReloadParamValuesClick.bind(
      this
    );
  }

  componentDidMount() {
    this.props.onReloadParamValues(
      this.props.paramName,
      this.state.fromDt,
      this.state.toDt
    );
  }

  handleReloadParamValuesClick() {
    this.props.onReloadParamValues(
      this.props.paramName,
      this.state.fromDt,
      this.state.toDt
    );
  }

  handleFromDateTimeChange(value) {
    this.setState({ fromDt: value });
  }

  handleToDateTimeChange(value) {
    this.setState({ toDt: value });
  }

  render() {
    const data = [];

    this.props.paramValues.forEach((vl) => {
      data.push({
        value: vl.value,
        // dt: vl.dt, // dt currently not works.
        dt: moment(vl.dt).format("yyy.MM.DD HH:mm"),
      });
    });

    return (
      <Container>
        <Card className="container">
          <div>
            <CardText>{this.props.paramName}</CardText>
          </div>
          <Grid container spacing={3}>
            <Grid container item xs={12}>
              <Grid container spacing={3} alignItems="center" justify="center">
                <Grid item>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDateTimePicker
                      // variant="inline"
                      label="From:"
                      ampm={false}
                      value={this.state.fromDt}
                      onChange={this.handleFromDateTimeChange}
                      onError={console.log}
                      format="yyyy/MM/dd HH:mm:ss"
                      showTodayButton
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDateTimePicker
                      // variant="inline"
                      label="To:"
                      ampm={false}
                      value={this.state.toDt}
                      onChange={this.handleToDateTimeChange}
                      onError={console.log}
                      format="yyyy/MM/dd HH:mm:ss"
                      showTodayButton
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={this.handleReloadParamValuesClick}
                  >
                    Reload
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Tabs>
            <Tab label="Chart">
                <ResponsiveContainer width="95%" height={600}>
                  <LineChart
                    width={1000}
                    height={600}
                    data={data}
                    margin={{
                      top: 70,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="dt" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Tab>              
              <Tab label="Table">
                <TableContainer>
                  <Table size="small" padding="none">
                    <TableHead>
                      <TableRow>
                        <TableCell>DateTime</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Quality</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.props.paramValues.map((value) => (
                        <TableRow
                          key={value.dt}
                          style={styles.cellCustomHeight}
                        >
                          <TableCell>
                            <Moment format="YYYY.MM.DD HH:mm:ss">
                              {value.dt}
                            </Moment>
                          </TableCell>
                          <TableCell>{value.value}</TableCell>
                          <TableCell>{value.qd}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Tab>
            </Tabs>
          </Grid>
        </Card>
      </Container>
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
      qd: PropTypes.string,
    })
  ),
  onReloadParamValues: PropTypes.func,
};
