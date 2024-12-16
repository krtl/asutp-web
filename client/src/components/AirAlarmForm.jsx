import React from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Container from "@material-ui/core/Container";
//import Typography from "@material-ui/core/Typography";
import { Card, CardText } from "material-ui/Card";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import TablePagination from '@material-ui/core/TablePagination';
// import Moment from "react-moment";

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
      checked: true,
      expanded: [],
    };

    this.handleReloadClick = this.handleReloadClick.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);

  }

  handleCheckboxChange(event) {
    this.setState({ checked: event.target.checked });
  }

  handleReloadClick(event, nodes) {
    this.setState({ expanded: nodes });
  }

  componentDidMount() {
    this.props.onReloadAirAlarms();
  }

  render() {

    let dispalayedAlarms = [];
    if (this.state.checked)
    {
      for (let i = 0; i < this.props.airAlarms.length; i++) {
        const AirAlarm = this.props.airAlarms[i];
        if (AirAlarm.type !== "")
        {
          dispalayedAlarms.push(AirAlarm);
        }
      }
    }
    else
    {
      dispalayedAlarms = this.props.airAlarms;
    }

    return (
      <Container>
        <Card className="container">
          <div>
          <h2><CardText>Повітряна тривога</CardText></h2>
            <FormControlLabel label="Показувати тільки активні"  control={
                <Checkbox color="primary" checked={this.state.checked} onChange={this.handleCheckboxChange}/>
                }
            />
          </div>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>RegionId</TableCell>
                  <TableCell>RegionName</TableCell>
                  <TableCell>RegionType</TableCell>
                  <TableCell>LastUpdate</TableCell>
                  <TableCell>AlertType</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dispalayedAlarms.map((alarm) => (
                  <TableRow key={alarm.regionId} style={styles.cellCustomHeight}>
                    <TableCell>{alarm.regionId}</TableCell>
                    <TableCell>{alarm.regionName}</TableCell>
                    <TableCell>{alarm.regionType}</TableCell>
                    <TableCell>
                        {alarm.lastUpdate}
                      </TableCell>
                    <TableCell>{alarm.type}</TableCell>
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
  onReloadAirAlarms: PropTypes.func,
  history: PropTypes.object.isRequired
};
