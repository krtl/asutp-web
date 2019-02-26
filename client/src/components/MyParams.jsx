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
    width: '6%',
  },
  cellCustomSizeHistory: {
    height: 12,
    width: '9%',
  }
};


export default class MyParams extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSchema: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLoadParamsClick = this.handleLoadParamsClick.bind(this);
  }

  componentDidMount() {

      const selectedSchemaName = localStorage.getItem('selectedSchema');

      if (selectedSchemaName) {
        for (let i = 0; i < this.props.schemas.length; i += 1) {
          if (this.props.schemas[i].name === selectedSchemaName) {
            this.setState({
              selectedSchema: this.props.schemas[i],
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
      selectedListItem = this.state.selectedSchema;
    }

    if (selectedListItem) {
      this.props.onLoadParams(selectedListItem.name);
      }
  }

  handleChange(event, index, value) {
    this.setState({ selectedSchema: value });

    this.handleLoadParamsClick(value);
  }

  render() {

    return (
      <div>
        <div>
          <SelectField
            floatingLabelText='Schema:'
            value={this.state.selectedSchema}
            onChange={this.handleChange}
            style={styles.customWidth}
          >
            {this.props.schemas.map(schema => (
              <MenuItem key={schema.name} value={schema} primaryText={schema.caption} secondaryText={schema.name} />
            ))
            }
          </SelectField>
        </div>
        <Table height='1000px'>
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
  schemas: PropTypes.array.isRequired,
  params: PropTypes.array.isRequired,
  onLoadParams: PropTypes.func,
};

