import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

// import TablePagination from '@mui/material/TablePagination';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Moment from "react-moment";
import moment from "moment";


const styles = {
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 200,
  },
};

export default function SoeConsumptionHistoryForm(props) {
  const [tabValue, setTabValue] = useState("table");
  const [fromDt, setFromDt] = useState(new Date().setDate(new Date().getDate() - 1));
  const [toDt, setToDt] = useState(new Date().setDate(new Date().getDate() + 1));
  
  useEffect(() => {
       props.onReloadParamValues(fromDt, toDt);
// eslint-disable-next-line       
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFromDateTimeChange = (value) => {
    setFromDt(value);
  };

  const handleToDateTimeChange = (value) => {
    setToDt(value);
  };

const handleReloadParamValuesClick = () => {
    props.onReloadParamValues(fromDt, toDt);
  };
  
  
    const data = [];
    props.paramValues.forEach((vl) => {
      data.push({
        key: vl.dt,
        value: vl.value,
        dt: moment(vl.dt).format("YYYY.MM.DD HH:mm"),
      });
    });

    return (
      <Container>
          <Stack spacing={3} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" component="h6">
            {"SOE Consumption"}
          </Typography>          
          <Grid container direction="row" spacing={3} sx={{justifyContent: "center",  alignItems: "center"}}>
                <Grid>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      // variant="inline"
                      label="From:"
                      defaultValue={moment(fromDt)}
                      onChange={handleFromDateTimeChange}
                      onError={console.log}
                      format="YYYY.MM.DD HH:mm:ss"
                      showTodayButton
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      // variant="inline"
                      label="To:"
                      defaultValue={moment(toDt)}
                      onChange={handleToDateTimeChange}
                      onError={console.log}
                      format="YYYY.MM.DD HH:mm:ss"
                      showTodayButton
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    onClick={handleReloadParamValuesClick}
                  >
                    Reload
                  </Button>
                </Grid>
            </Grid>
        </Stack>

          <Grid>
            <TabContext value={tabValue}>
              <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                <Tab label="Table" value="table" />
                <Tab label="Chart" value="chart" />
              </TabList>
              <TabPanel value="table">
                <TableContainer>
                  <Table size="small" padding="none">
                    <TableHead>
                      <TableRow>
                        <TableCell>DateTime</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Quality</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {props.paramValues.map((value) => (
                        <TableRow
                          key={value.dt}
                          style={styles.cellCustomHeight}
                        >
                          <TableCell>
                            <Moment format="YYYY.MM.DD HH:mm:ss">
                              {value.dt}
                            </Moment>
                          </TableCell>
                          <TableCell>{value.value}</TableCell>
                          <TableCell>{value.qd}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel value="chart">
                <ResponsiveContainer width="95%" height={600}>
                 <LineChart
                    width={1000}
                    height={600}
                    data={data}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 90,
                    }}
                  >
                    <XAxis dataKey="dt" angle="-90" tickMargin={60} />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip contentStyle={{ backgroundColor: "#9c9c9a" }} />                   
                    <Line type="monotone" dataKey="value" strokeWidth={3} stroke="#656ddd" />
                  </LineChart> 
                </ResponsiveContainer>
              </TabPanel>
            </TabContext>
          </Grid>
      </Container>
    );
}

SoeConsumptionHistoryForm.propTypes = {
  paramValues: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      dt: PropTypes.string,
      qd: PropTypes.string,
    })
  ),
  onReloadParamValues: PropTypes.func,
};
