import React from 'react';
import { Link } from 'react-router';
import PropTypes from "prop-types";
// import { styled } from '@material-ui/styles';
import SelectField from 'material-ui/SelectField';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import MenuItem from 'material-ui/MenuItem';

/* global localStorage */


// const MyTableRow = styled(TableRow)({
//   height: 10,
// });

// const MyTable = styled(Table)({
//   minWidth: 700
// });

const styles = {
  customWidth: {
    width: 750,
  },
  cellCustomHeight: {
    height: 12,
  }
};


export default class MyPSs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRegion: '',
      paramLists: [],
      params: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLoadPSsClick = this.handleLoadPSsClick.bind(this);
  }

   handleLoadPSsClick(selectedListItem) {
    if (selectedListItem === undefined) {
      selectedListItem = this.state.selectedRegion;
    }

    if (selectedListItem) {

      this.props.onLoadPSs(selectedListItem.name);

      }
  }

  handleChange(event, index, value) {
    this.setState({ selectedRegion: value });

    this.handleLoadPSsClick(value);
  }

  render() {

    return (
      <div>
        <div>
          <SelectField
            floatingLabelText='Regions:'
            value={this.state.selectedRegion}
            onChange={this.handleChange}
            style={styles.customWidth}
          >
            {this.props.regions.map(region => (
              <MenuItem key={region.name} value={region} primaryText={region.caption} secondaryText={region.name} />
            ))
            }
          </SelectField>
        </div>
        <Table height='600px'>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Caption</TableHeaderColumn>
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.PSs.map(ps => (
              <TableRow key={ps.name} style={styles.cellCustomHeight}> 
                <TableRowColumn  style={styles.cellCustomHeight}>{ps.name}</TableRowColumn>
                <TableRowColumn  style={styles.cellCustomHeight}>{ps.caption}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomHeight}>
                  <Link to={`/psScheme/${ps.name}`}>Scheme</Link>
                </TableRowColumn>
              </TableRow>))
          }
          </TableBody>
        </Table>
      </div>
    );
  }
}

MyPSs.propTypes = {
    regions: PropTypes.array.isRequired,
    PSs: PropTypes.array.isRequired,
    onLoadPSs: PropTypes.func,
};

