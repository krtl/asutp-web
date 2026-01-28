import React from "react";
import PropTypes from "prop-types";
import {
  DatePicker,
  LocalizationProvider,
} from "@mui/lab";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import TablePagination from '@mui/material/TablePagination';

import Moment from "react-moment";
import DateFnsUtils from "@date-io/date-fns";

const styles = {
  userNameFieldWidth: {
    width: 250,
  },
};

export default class UserActionsForm extends React.Component {
  constructor(props) {
    super(props);

    // console.log(`${this.props}`);

    let montAgo = new Date();
    montAgo.setDate(new Date().getDate() - 30);
    let tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    this.state = {
      userName: undefined,
      fromDt: montAgo,
      toDt: tomorrow,
    };

    this.handleSelectedUserChange = this.handleSelectedUserChange.bind(this);
    this.handleFromDateTimeChange = this.handleFromDateTimeChange.bind(this);
    this.handleToDateTimeChange = this.handleToDateTimeChange.bind(this);
    this.handleReloadUserActionsClick = this.handleReloadUserActionsClick.bind(
      this
    );
  }

  componentDidMount() {
    this.handleReloadUserActionsClick();
  }

  handleSelectedUserChange(event) {
    this.setState({ userName: event.target.value });
  }

  handleReloadUserActionsClick() {
    this.props.onReloadUserActions(
      this.state.userName,
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
                  label="User:"
                  onChange={this.handleSelectedUserChange}
                  value={this.state.userName}
                  style={styles.userNameFieldWidth}
                />
              </Grid>
              <Grid item>
                <LocalizationProvider utils={DateFnsUtils}>
                  <DatePicker
                    // variant="inline"
                    label="From:"
                    ampm={false}
                    value={this.state.fromDt}
                    onChange={this.handleFromDateTimeChange}
                    onError={console.log}
                    format="yyyy/MM/dd HH:mm:ss"
                    showTodayButton
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item>
                <LocalizationProvider utils={DateFnsUtils}>
                  <DatePicker
                    // variant="inline"
                    label="To:"
                    ampm={false}
                    value={this.state.toDt}
                    onChange={this.handleToDateTimeChange}
                    onError={console.log}
                    format="yyyy/MM/dd HH:mm:ss"
                    showTodayButton
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={this.handleReloadUserActionsClick}
                >
                  Reload
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table size="small" padding="none">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Host</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.userActions.map((userAction) => (
                    <TableRow key={userAction.dt}>
                      <TableCell>
                        <Moment format="YYYY.MM.DD HH:mm:ss">
                          {userAction.dt}
                        </Moment>
                      </TableCell>
                      <TableCell>{`${userAction.user.name}(${userAction.user.email})`}</TableCell>
                      <TableCell>{userAction.action}</TableCell>
                      <TableCell>{userAction.params}</TableCell>
                      <TableCell>{userAction.host}</TableCell>
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

UserActionsForm.propTypes = {
  userActions: PropTypes.arrayOf(
    PropTypes.shape({
      dt: PropTypes.string,
      user: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      action: PropTypes.string,
      params: PropTypes.string,
      host: PropTypes.string,
    })
  ),
  onReloadUserActions: PropTypes.func,
  history: PropTypes.object.isRequired,
};
