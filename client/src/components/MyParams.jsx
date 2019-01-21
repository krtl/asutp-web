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
import Moment from 'react-moment';

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
  headerCustomSizeName: {
    width: '30%',
  },
  headerCustomSizeCaption: {
    width: '25%',
  },
  headerCustomSizeValue: {
    width: '10%',
  },
  headerCustomSizeDT: {
    width: '15%',
  },
  headerCustomSizeQD: {
    width: '7%',
  },
  headerCustomSizeHistory: {
    width: '8%',
  }, 
  cellCustomSizeName: {
    height: 12,
    width: '30%',
  },
  cellCustomSizeCaption: {
    height: 12,
    width: '25%',
  },
  cellCustomSizeValue: {
    height: 12,
    width: '10%',
  },
  cellCustomSizeDT: {
    height: 12,
    width: '15%',
  },
  cellCustomSizeQD: {
    height: 12,
    width: '7%',
  },
  cellCustomSizeHistory: {
    height: 12,
    width: '8%',
  }
};


export default class MyParams extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedParamList: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLoadParamsClick = this.handleLoadParamsClick.bind(this);
  }

  componentDidMount() {

      const selectedParamListName = localStorage.getItem('selectedParamList');

      if (selectedParamListName) {
        for (let i = 0; i < this.props.paramLists.length; i += 1) {
          if (this.props.paramLists[i].name === selectedParamListName) {
            this.setState({
              selectedParamList: this.props.paramLists[i],
            });
            this.handleLoadParamsClick();
            break;
          }
        }
      }
    // });
  }
  
  handleLoadParamsClick(selectedListItem) {
    if (selectedListItem === undefined) {
      selectedListItem = this.state.selectedParamList;
    }

    if (selectedListItem) {
      this.props.onLoadParams(selectedListItem.name);
      }
  }

  handleChange(event, index, value) {
    this.setState({ selectedParamList: value });

    this.handleLoadParamsClick(value);
  }

  render() {

    return (
      <div>
        <div>
          <SelectField
            floatingLabelText='Params List:'
            value={this.state.selectedParamList}
            onChange={this.handleChange}
            style={styles.customWidth}
          >
            {this.props.paramLists.map(paramList => (
              <MenuItem key={paramList.name} value={paramList} primaryText={paramList.caption} secondaryText={paramList.name} />
            ))
            }
          </SelectField>
        </div>
        <Table height='600px'>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={styles.cellCustomSizeName}>Name</TableHeaderColumn>
              <TableHeaderColumn style={styles.cellCustomSizeCaption}>Caption</TableHeaderColumn>
              <TableHeaderColumn style={styles.cellCustomSizeValue}>Value</TableHeaderColumn>
              <TableHeaderColumn style={styles.cellCustomSizeDT}>Time</TableHeaderColumn>
              <TableHeaderColumn style={styles.cellCustomSizeQD}>Quality</TableHeaderColumn>
              <TableHeaderColumn style={styles.cellCustomSizeHistory}/>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.params.map(param => (
              <TableRow key={param.name} style={styles.cellCustomHeight}> 
                <TableRowColumn style={styles.cellCustomSizeName}>{param.name}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomSizeCaption}>{param.caption}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomSizeValue}>{param.value}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomSizeDT}><Moment format='YYYY.MM.DD HH:mm:ss'>{param.dt}</Moment></TableRowColumn>
                <TableRowColumn style={styles.cellCustomSizeQD}>{param.qd}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomSizeHistory}>
                  <Link to={`/paramHistory/${param.name}`}>History</Link>
                </TableRowColumn>
              </TableRow>))
          }
          </TableBody>
        </Table>
      </div>
    );
  }
}

MyParams.propTypes = {
  paramLists: PropTypes.array.isRequired,
  params: PropTypes.array.isRequired,
  onLoadParams: PropTypes.func,
};

