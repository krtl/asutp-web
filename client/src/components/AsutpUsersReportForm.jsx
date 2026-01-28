import React from "react";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from '@mui/material/Stack';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import TablePagination from '@mui/material/TablePagination';
import Typography from "@mui/material/Typography";

import Moment from "react-moment";

const styles = {
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 200,
  },
};

export default class MySoeConsumptionHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleReloadReportClick = this.handleReloadReportClick.bind(this);
  }

  componentDidMount() {
    this.props.onReloadUsersReport();
  }

  handleReloadReportClick() {
    this.props.onReloadUsersReport();
  }

  render() {
    return (
      <Container>
          <Stack spacing={3} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" component="h6">
            {"Користувачі АСУТП"}
          </Typography>
            <Button variant="outlined" onClick={this.handleReloadReportClick}>
              Reload
            </Button>
        </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Login</TableCell>
                  <TableCell>UID</TableCell>
                  <TableCell>Descr</TableCell>
                  <TableCell>ServerIPs</TableCell>
                  <TableCell>ClientIPs</TableCell>
                  <TableCell>LastActivity</TableCell>
                  <TableCell>EventsCount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.users.map((user) => (
                  <TableRow key={user.UID} style={styles.cellCustomHeight}>
                    <TableCell>{user.Login}</TableCell>
                    <TableCell>{user.UID}</TableCell>
                    <TableCell>{user.Descr}</TableCell>
                    <TableCell>{user.ServerIPs}</TableCell>
                    <TableCell>{user.ClientIPs}</TableCell>
                    <TableCell>
                      <Moment format="YYYY.MM.DD HH:mm:ss">
                        {user.LastActivity}
                      </Moment>
                    </TableCell>
                    <TableCell>{user.EventsCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </Container>
    );
  }
}

MySoeConsumptionHistoryForm.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      UID: PropTypes.string,
      Login: PropTypes.string,
      Descr: PropTypes.string,
      ServerIPs: PropTypes.string,
      ClientIPs: PropTypes.string,
      LastActivity: PropTypes.string,
      EventsCount: PropTypes.number,
    })
  ),
  onReloadUsersReport: PropTypes.func,
};
