import React from "react";
import PropTypes from "prop-types";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
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

const styles = {
  schemaComboWidth: {
    width: 350,
  },
  actionComboWidth: {
    width: 270,
  },
};

export default class UserActionsForm extends React.Component {
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
      toDt: tomorrow,
      selectedUser: undefined,
      selectedAction: undefined,
    };

    this.handleSelectedUserChange = this.handleSelectedUserChange.bind(this);
    this.handleSelectedActionChange = this.handleSelectedActionChange.bind(
      this
    );
    this.handleFromDateTimeChange = this.handleFromDateTimeChange.bind(this);
    this.handleToDateTimeChange = this.handleToDateTimeChange.bind(this);
    this.handleReloadUserActionsClick = this.handleReloadUserActionsClick.bind(
      this
    );
  }

  componentDidMount() {
    this.handleReloadUserActionsClick();
  }

  handleSelectedUserChange(event, index, value) {
    this.setState({ selectedUser: value });
  }

  handleSelectedActionChange(event, index, value) {
    this.setState({ selectedAction: value });
  }

  handleReloadUserActionsClick() {
    this.props.onReloadUserActions(
      this.state.selectedUser,
      this.state.selectedAction,
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
    const actions = []; //extract actions
    const users = []; //extract users
    actions.push("");
    users.push("");
    this.props.userActions.forEach((element) => {
      const found = users.some((user) => user._id === element.user._id);
      if (!found) {
        if (
          this.state.selectedUser &&
          this.state.selectedUser._id === element.user._id
        ) {
          users.push(this.state.selectedUser);
        } else {
          users.push(element.user);
        }
      }

      if (actions.indexOf(element.action) < 0) {
        actions.push(element.action);
      }
    });

    return (
      <div>
        <Grid container spacing={3}>
          <Grid container item xs={12}>
            <Grid container spacing={3} alignItems="center" justify="center">
              <Grid item>
                <SelectField
                  floatingLabelText="User:"
                  value={this.state.selectedUser}
                  onChange={this.handleSelectedUserChange}
                  style={styles.schemaComboWidth}
                >
                  {users.map((user) => (
                    <MenuItem
                      key={user._id}
                      value={user}
                      primaryText={user.name}
                      secondaryText={user.email}
                    />
                  ))}
                </SelectField>
              </Grid>
              <Grid item>
                <SelectField
                  floatingLabelText="Action:"
                  value={this.state.selectedAction}
                  onChange={this.handleSelectedActionChange}
                  style={styles.actionComboWidth}
                >
                  {actions.map((item) => (
                    <MenuItem key={item} value={item} primaryText={item} />
                  ))}
                </SelectField>
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
