import React from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider
} from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import TablePagination from '@material-ui/core/TablePagination';

import Moment from "react-moment";
import DateFnsUtils from "@date-io/date-fns";

export default class MyNodeStateHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    // console.log(`${this.props}`);

    let yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);
    let tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    this.state = {
      nodeName: props.nodeName,
      fromDt: yesterday,
      toDt: tomorrow
    };

    this.handleNodeNameChange = this.handleNodeNameChange.bind(this);
    this.handleFromDateTimeChange = this.handleFromDateTimeChange.bind(this);
    this.handleToDateTimeChange = this.handleToDateTimeChange.bind(this);
    this.handleReloadStateValuesClick = this.handleReloadStateValuesClick.bind(
      this
    );
  }

  handleNodeNameChange(event, value) {
    this.setState({ nodeName: value });
  }

  handleReloadStateValuesClick() {
    this.props.reloadStateHistory(
      this.state.nodeName,
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
    return (
      <div>
        <Grid container spacing={3}>
          <Grid container item xs={12}>
            <Grid container spacing={3} alignItems="center" justify="center">
              <Grid item>
                <TextField
                  label="NodeName:"
                  onChange={this.handleNodeNameChange}
                  value={this.state.nodeName}
                />
              </Grid>
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
                  onClick={this.handleReloadStateValuesClick}
                >
                  Reload
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table size="small" padding="none">
                <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Old State</TableCell>
                    <TableCell>New State</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody displayRowCheckbox={false}>
                  {this.props.stateValues.map(stateValue => (
                    <TableRow key={stateValue.dt}>
                      <TableCell>{stateValue.nodeName}</TableCell>
                      <TableCell>{stateValue.oldState}</TableCell>
                      <TableCell>{stateValue.newState}</TableCell>
                      <TableCell>
                        <Moment format="YYYY.MM.DD HH:mm:ss">
                          {stateValue.dt}
                        </Moment>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </div>
    );
  }
}

MyNodeStateHistoryForm.propTypes = {
  nodeName: PropTypes.string,
  stateValues: PropTypes.arrayOf(
    PropTypes.shape({
      nodeName: PropTypes.string,
      oldState: PropTypes.number,
      newState: PropTypes.number,
      dt: PropTypes.string
    })
  ),
  reloadStateHistory: PropTypes.func,
  history: PropTypes.object.isRequired
};
