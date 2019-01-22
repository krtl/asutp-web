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
  },
  cellCustomSize1: {
    height: 12,
    width: '30%',
  },
  cellCustomSize2: {
    height: 12,
    width: '50%',
  },
  cellCustomSize3: {
    height: 12,
    width: '10%',
  },
  cellCustomSize4: {
    height: 12,
    width: '10%',
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
        {/* <colgroup>
          <col style={{width:'10%'}}/>
          <col style={{width:'80%'}}/>
          <col style={{width:'10%'}}/>
        </colgroup> */}
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Caption</TableHeaderColumn>
              <TableHeaderColumn />
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.PSs.map(ps => (
              <TableRow key={ps.name} style={styles.cellCustomHeight}> 
                <TableRowColumn style={styles.cellCustomSize1}>{ps.name}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomSize2}>{ps.caption}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomSize3} > 
                  <Link to={`/psScheme/${ps.name}`}>Scheme</Link>
                </TableRowColumn>
                <TableRowColumn style={styles.cellCustomSize3} > 
                  <Link to={`/psAsutpLinkage/${ps.name}`}>Linkage</Link>
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

