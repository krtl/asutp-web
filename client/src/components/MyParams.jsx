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

// import MyStompClient from '../modules/MyStompClient';

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
    // MyStompClient.loadParamLists((paramLists) => {
    //   this.setState({
    //     paramLists: paramLists.slice(0, MATCHING_LISTS_LIMIT),
    //   });

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

  componentWillUnmount() {
    // MyStompClient.unsubscribeFromValues();
  }

  handleLoadParamsClick(selectedListItem) {
    if (selectedListItem === undefined) {
      selectedListItem = this.state.selectedParamList;
    }

    if (selectedListItem) {
      this.props.onLoadParams(selectedListItem.name);
  
      // MyStompClient.subscribeToValues(selectedListItem.name, (value) => {
      //   const locParams = locThis.state.params.slice();
      //   let b = false;
      //   for (let i = 0; i < locParams.length; i += 1) {
      //     const locParam = locParams[i];
      //     if (locParam.name === value.paramName) {
      //       locParam.value = value.value;
      //       locParam.dt = value.dt;
      //       locParam.qd = value.qd;
      //       b = true;
      //       break;
      //     }
      //   }
      //   if (b) {
      //     this.setState({
      //       params: locParams,
      //     });
      //   }
      // });
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
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Caption</TableHeaderColumn>
              <TableHeaderColumn>Value</TableHeaderColumn>
              <TableHeaderColumn>Time</TableHeaderColumn>
              <TableHeaderColumn>Quality</TableHeaderColumn>
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.params.map(param => (
              <TableRow key={param.name} style={styles.cellCustomHeight}> 
                <TableRowColumn  style={styles.cellCustomHeight}>{param.name}</TableRowColumn>
                <TableRowColumn  style={styles.cellCustomHeight}>{param.caption}</TableRowColumn>
                <TableRowColumn  style={styles.cellCustomHeight}>{param.value}</TableRowColumn>
                <TableRowColumn  style={styles.cellCustomHeight}><Moment format='YYYY.MM.DD HH:mm:ss'>{param.dt}</Moment></TableRowColumn>
                <TableRowColumn style={styles.cellCustomHeight}>{param.qd}</TableRowColumn>
                <TableRowColumn style={styles.cellCustomHeight}>
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

