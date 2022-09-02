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

export default class AirAlarmForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: [],
    };

    this.handleReloadClick = this.handleReloadClick.bind(this);
  }

  handleReloadClick(event, nodes) {
    this.setState({ expanded: nodes });
  }

  componentDidMount() {
    this.props.onReloadAirAlarms();
  }

  render() {
    return (
      <Container>
        <Card className="container">
          <div>
            <CardText>Air Alarms</CardText>
            <Button variant="outlined" onClick={this.handleReloadClick}>
              Reload
            </Button>
          </div>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>regionId</TableCell>
                  <TableCell>regionName</TableCell>
                  <TableCell>regionType</TableCell>
                  <TableCell>startDate</TableCell>
                  <TableCell>endDate</TableCell>
                  <TableCell>duration</TableCell>
                  <TableCell>alertType</TableCell>
                  <TableCell>isContinue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.airAlarms.map((alarm) => (
                  <TableRow key={alarm.regionId} style={styles.cellCustomHeight}>
                    <TableCell>{alarm.regionId}</TableCell>
                    <TableCell>{alarm.regionName}</TableCell>
                    <TableCell>{alarm.regionType}</TableCell>
                    <TableCell>
                      <Moment format="YYYY.MM.DD HH:mm:ss">
                        {alarm.startDate}
                      </Moment>
                      </TableCell>
                      <TableCell>
                      <Moment format="YYYY.MM.DD HH:mm:ss">
                        {alarm.endDate}
                      </Moment>                    
                      </TableCell>
                    <TableCell>{alarm.duration}</TableCell>
                    <TableCell>{alarm.alertType}</TableCell>
                    <TableCell>{alarm.isContinue}</TableCell>
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

AirAlarmForm.propTypes = {
  airAlarms: PropTypes.arrayOf(
    PropTypes.shape({
      regionName: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      duration: PropTypes.array,
      alertType: PropTypes.array,
      isContinue: PropTypes.array,
    })
  ),  
  activeAirAlarms: PropTypes.array.isRequired,
  onReloadAirAlarms: PropTypes.func,
  history: PropTypes.object.isRequired
};
