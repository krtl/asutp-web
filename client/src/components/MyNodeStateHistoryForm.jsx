import React from "react";
import PropTypes from "prop-types";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import TablePagination from '@material-ui/core/TablePagination';
import Moment from "react-moment";

export default class MyNodeStateHistoryForm extends React.Component {
  constructor(props) {
    super(props);

    console.log(`${this.props}`);

    this.state = {
      nodeName: props.nodeName
    };

    this.handleNodeNameChange = this.handleNodeNameChange.bind(this);
    this.handleReloadStateValuesClick = this.handleReloadStateValuesClick.bind(
      this
    );
  }

  handleNodeNameChange(event, value) {
    this.setState({ nodeName: value });
  }

  handleReloadStateValuesClick() {
    this.props.reloadStateHistory(this.state.nodeName);
  }

  render() {
    return (
      <div>
        <div className="field-line">
          <TextField
            floatingLabelText="nodeName"
            name="nodeName"
            onChange={this.handleNodeNameChange}
            value={this.state.nodeName}
          />
          <RaisedButton onClick={this.handleReloadStateValuesClick}>
            Reload
          </RaisedButton>
        </div>
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
