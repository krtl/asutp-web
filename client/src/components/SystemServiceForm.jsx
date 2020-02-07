import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "material-ui/Tabs";
import RaisedButton from "material-ui/RaisedButton";
// import SelectField from 'material-ui/SelectField';
import { Card, CardText } from "material-ui/Card";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import Moment from "react-moment";

const styles = {
  cellCustomHeight: {
    height: 12
  }
};

export default class SystemServiceForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleReloadCollisionsClick = this.handleReloadCollisionsClick.bind(
      this
    );
    this.handleReloadBlockedParamsClick = this.handleReloadBlockedParamsClick.bind(
      this
    );
  }

  componentDidMount() {
    this.props.onReloadCollisions();
    this.props.onReloadBlockedParams();
  }

  handleReloadCollisionsClick() {
    this.props.onReloadCollisions();
  }

  handleReloadBlockedParamsClick() {
    this.props.onReloadBlockedParams();
  }

  render() {
    return (
      <Card className="container">
        <div>
          <CardText>{this.props.paramName}</CardText>
          <RaisedButton onClick={this.handleReloadCollisionsClick}>
            Collisions
          </RaisedButton>
          <RaisedButton onClick={this.handleReloadBlockedParamsClick}>
            BlockedParams
          </RaisedButton>
        </div>

        <Tabs>
          <Tab label="Collisions">
            <Table height="1000px">
              <TableHeader
                adjustForCheckbox={false}
                displaySelectAll={false}
              ></TableHeader>
              <TableBody displayRowCheckbox={false}>
                {this.props.collisions.map((value, index) => (
                  <TableRow key={index} style={styles.cellCustomHeight}>
                    <TableRowColumn style={styles.cellCustomHeight}>
                      {value}
                    </TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tab>
          <Tab label="Blocked Params">
            <Table height="1000px">
              <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>DateTime</TableHeaderColumn>
                  <TableHeaderColumn>User</TableHeaderColumn>
                  <TableHeaderColumn />
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {this.props.blockedParams.map((value, index) => (
                  <TableRow key={index} style={styles.cellCustomHeight}>
                    <TableRowColumn style={styles.cellCustomHeight}>
                      {value.name}
                    </TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>
                      <Moment format="YYYY.MM.DD HH:mm:ss">{value.dt}</Moment>
                    </TableRowColumn>
                    <TableRowColumn style={styles.cellCustomHeight}>
                      {value.user}
                    </TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tab>
        </Tabs>
      </Card>
    );
  }
}

SystemServiceForm.propTypes = {
  collisions: PropTypes.arrayOf(PropTypes.string),
  blockedParams: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      dt: PropTypes.string,
      user: PropTypes.string
    })
  ),

  onReloadCollisions: PropTypes.func,
  onReloadBlockedParams: PropTypes.func
};
