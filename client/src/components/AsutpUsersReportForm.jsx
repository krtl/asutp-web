import React from "react";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import { Card, CardText } from "material-ui/Card";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import TablePagination from '@material-ui/core/TablePagination';
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
        <Card className="container">
          <div>
            <CardText>Користувачі АСУТП</CardText>
            <Button variant="outlined" onClick={this.handleReloadReportClick}>
              Reload
            </Button>
          </div>
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
        </Card>
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
