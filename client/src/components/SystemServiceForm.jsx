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
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
// import Typography from "@material-ui/core/Typography";

import Moment from "react-moment";

const styles = {
  cellCustomHeight: {
    height: 12
  }
};

export default class SystemServiceForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: []
    };

    this.handleReloadCollisionsClick = this.handleReloadCollisionsClick.bind(
      this
    );
    this.handleReloadBlockedParamsClick = this.handleReloadBlockedParamsClick.bind(
      this
    );
    this.handleReloadAsutpConnectionsClick = this.handleReloadAsutpConnectionsClick.bind(
      this
    );

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, nodes) {
    this.setState({ expanded: nodes });
  }

  componentDidMount() {
    // this.props.onReloadCollisions();
    // this.props.onReloadBlockedParams();
    this.props.onReloadAsutpConnections();
  }

  handleReloadCollisionsClick() {
    this.props.onReloadCollisions();
  }

  handleReloadBlockedParamsClick() {
    this.props.onReloadBlockedParams();
  }

  handleReloadAsutpConnectionsClick() {
    this.props.onReloadAsutpConnections();
  }

  render() {
    let treeItems = [];

    for (let i = 0; i < this.props.asutpConnections.length; i++) {
      const ps = this.props.asutpConnections[i];
      let connectionTreeItems = [];
      for (let j = 0; j < ps.connections.length; j++) {
        const connection = ps.connections[j];

        let paramTreeItems = [];
        for (let k = 0; k < connection.params.length; k++) {
          const param = connection.params[k];
          paramTreeItems.push(
            <TreeItem
              key={param.key}
              nodeId={param.key.toString()}
              label={`${param.name}(${param.caption}): ${param.value}`}
            ></TreeItem>
          );
        }
        connectionTreeItems.push(
          <TreeItem
            key={connection.key}
            nodeId={connection.key.toString()}
            label={`${connection.caption} ${connection.voltage} (${connection.connectionNumber}) [${connection.name}]`}
          >
            {paramTreeItems}
          </TreeItem>
        );
      }
      treeItems.push(
        <TreeItem
          key={ps.key}
          nodeId={ps.key.toString()}
          label={`${ps.name}(${ps.caption}) ${ps.sapCode} `}
        >
          {connectionTreeItems}
        </TreeItem>
      );
    }

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
          <RaisedButton onClick={this.handleReloadAsutpConnectionsClick}>
            AsutpConnections
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
          <Tab label="ASUTP Connections">
            <TreeView
              // style={styles.root}
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              expanded={this.state.expanded}
              onNodeToggle={this.handleChange}
            >
              {treeItems}
            </TreeView>
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
  asutpConnections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      caption: PropTypes.string,
      sapCode: PropTypes.string,
      connections: PropTypes.array
    })
  ),

  onReloadCollisions: PropTypes.func,
  onReloadBlockedParams: PropTypes.func,
  onReloadAsutpConnections: PropTypes.func
};
