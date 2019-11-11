import React from "react";
import PropTypes from "prop-types";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
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
        <Table height="300px">
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Old State</TableHeaderColumn>
              <TableHeaderColumn>New State</TableHeaderColumn>
              <TableHeaderColumn>Time</TableHeaderColumn>
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.stateValues.map(stateValue => (
              <TableRow key={stateValue.dt}>
                <TableRowColumn>{stateValue.nodeName}</TableRowColumn>
                <TableRowColumn>{stateValue.oldState}</TableRowColumn>
                <TableRowColumn>{stateValue.newState}</TableRowColumn>
                <TableRowColumn>
                  <Moment format="YYYY.MM.DD HH:mm:ss">{stateValue.dt}</Moment>
                </TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
