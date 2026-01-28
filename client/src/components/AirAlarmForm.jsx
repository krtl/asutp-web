import React from "react";
import PropTypes from "prop-types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from '@mui/material/Stack';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import TablePagination from '@mui/material/TablePagination';
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
          <Stack spacing={1} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" component="h5">
              Повітряна тривога
            </Typography>
            <FormControlLabel label="Показувати тільки активні"  control={
                <Checkbox color="primary" checked={this.state.checked} onChange={this.handleCheckboxChange}/>
                }
            />
           </Stack> 
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
