import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// import { styled } from '@material-ui/styles';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Moment from "react-moment";

// const MyTableRow = styled(TableRow)({
//   height: 10,
// });

// const MyTable = styled(Table)({
//   minWidth: 700
// });

const styles = {
  customWidth: {
    width: 750
  },
  cellCustomHeight: {
    height: 12
  },
  headerCustomSizeName: {
    width: "30%"
  },
  headerCustomSizeCaption: {
    width: "25%"
  },
  headerCustomSizeValue: {
    width: "10%"
  },
  headerCustomSizeDT: {
    width: "15%"
  },
  headerCustomSizeQD: {
    width: "7%"
  },
  headerCustomSizeHistory: {
    width: "8%"
  },
  cellCustomSizeName: {
    height: 12,
    width: "30%"
  },
  cellCustomSizeCaption: {
    height: 12,
    width: "25%"
  },
  cellCustomSizeValue: {
    height: 12,
    width: "10%"
  },
  cellCustomSizeDT: {
    height: 12,
    width: "15%"
  },
  cellCustomSizeQD: {
    height: 12,
    width: "6%"
  },
  cellCustomSizeHistory: {
    height: 12,
    width: "9%"
  }
};

export default class MyParams extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <TableContainer>
        <Table size="small" padding="none">
          <TableHead adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableCell style={styles.cellCustomSizeName}>Name</TableCell>
              <TableCell style={styles.cellCustomSizeCaption}>
                Caption
              </TableCell>
              <TableCell style={styles.cellCustomSizeValue}>Value</TableCell>
              <TableCell style={styles.cellCustomSizeDT}>Time</TableCell>
              <TableCell style={styles.cellCustomSizeQD}>Quality</TableCell>
              <TableCell style={styles.cellCustomSizeHistory} />
            </TableRow>
          </TableHead>
          <TableBody displayRowCheckbox={false}>
            {this.props.params.map(param => (
              <TableRow key={param.name} style={styles.cellCustomHeight}>
                <TableCell style={styles.cellCustomSizeName}>
                  {param.name}
                </TableCell>
                <TableCell style={styles.cellCustomSizeCaption}>
                  {param.caption}
                </TableCell>
                <TableCell style={styles.cellCustomSizeValue}>
                  {param.value}
                </TableCell>
                <TableCell style={styles.cellCustomSizeDT}>
                  <Moment format="YYYY.MM.DD HH:mm:ss">{param.dt}</Moment>
                </TableCell>
                <TableCell style={styles.cellCustomSizeQD}>
                  {param.qd}
                </TableCell>
                <TableCell style={styles.cellCustomSizeHistory}>
                  <Link to={`/paramHistory/${param.name}`}>History</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

MyParams.propTypes = {
  params: PropTypes.array.isRequired
};
