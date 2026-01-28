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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import TablePagination from '@material-ui/core/TablePagination';
import Stack from '@mui/material/Stack';

import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
// import NativeSelect from '@material-ui/core/NativeSelect';

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


export default function PowerLoadsHistoryForm(props) {
  const [tabValue, setTabValue] = useState("table");
  const [selectedRes, setSelectedRes] = useState("");
  const [selectedPs, setSelectedPs] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");
  const [fromDt, setFromDt] = React.useState(new Date().setDate(new Date().getDate() - 1));
  const [toDt, setToDt] = React.useState(new Date().setDate(new Date().getDate() + 1));

  useEffect(() => {
       props.onReloadReses();
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
    if (selectedConnection !== "") {
      props.onReloadParamValues(selectedConnection,fromDt, toDt);
    }
  };

  // const handleReloadResesClick = () => {
  //   props.onReloadReses();
  // };

  const handleResChange = (event) => {
    setSelectedRes(event.target.value);
  };

  const handlePsChange = (event) => {
    setSelectedPs(event.target.value);
  };

  const handleConnectionChange = (event) => {
    setSelectedConnection(event.target.value);
  };  


    const data = [];
    let locResOptions = [];
    let locPsOptions = [];
    let locConnectionOptions = [];

    locResOptions.push(
          <option
            key={"empty"}
            value={""}
          >
            {""}
          </option>);    
    locPsOptions.push(
          <option
            key={"empty"}
            value={""}
          >
            {""}
          </option>);
    locConnectionOptions.push(
          <option
            key={"empty"}
            value={""}
          >
            {""}
          </option>);

    for (let i = 0; i < props.asutpReses.length; i++) {
      const res = props.asutpReses[i];
            locResOptions.push(
          <option          
            key={res.Name}
            value={res.Name}
          >
            {res.Caption}
          </option>);
      if (res.Name === selectedRes) {
        for (let j = 0; j < res.PSs.length; j++) {
          const ps = res.PSs[j];
          locPsOptions.push(
          <option
            key={ps.Name}
            value={ps.Name}
          >
            {ps.Caption}
          </option>);

          if (ps.Name === selectedPs) {
            if (ps.Name === "Реклоузери") {
              for (let k = 0; k < res.Reclosers.length; k++) {
                const recloser = res.Reclosers[k];
                    locConnectionOptions.push(
                      <option
                        key={recloser.P}
                        value={recloser.P}
                      >
                      {recloser.Caption}
                      </option>);
                }
            }else{
              for (let k = 0; k < ps.Connections.length; k++) {
                const connection = ps.Connections[k];
                    locConnectionOptions.push(
                      <option
                        key={connection.P}
                        value={connection.P}
                      >
                      {connection.Caption}
                      </option>);
                }       
              }            
            }
        }
      }
    }  

    props.paramValues.forEach((vl) => {
      data.push({
        value: vl.value,
        dt: moment(vl.dt).format("YYYY.MM.DD HH:mm"),
      });
    });

    return (
      <Container>
          <Stack spacing={1} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" component="h6">
            {"Power Loads"}
          </Typography>
            <Select
              size="small"
              native
              labelId="demo-select-small-label"
              id="demo-select-small"              
              value={selectedRes}
              onChange={handleResChange}
              inputProps={{
                name: 'res',
                id: 'res',
              }}
            >
              {locResOptions}
            </Select>  
            <Select
              size="small"
              native
              value={selectedPs}
              onChange={handlePsChange}
              inputProps={{
                name: 'ps',
                id: 'ps',
              }}
            >
              {locPsOptions}
            </Select>  
            <Select
              size="small"
              native
              value={selectedConnection}
              onChange={handleConnectionChange}
              inputProps={{
                name: 'connection',
                id: 'connection',
              }}
            >
              {locConnectionOptions}
            </Select>  
            <Grid container direction="row" spacing={3} sx={{justifyContent: "center",  alignItems: "center"}}>
                <Grid>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      // variant="inline"
                      size="small"
                      label="From:"
                      // ampm={false}
                      defaultValue={moment(fromDt)}
                      onChange={handleFromDateTimeChange}
                      onError={console.log}
                      format="YYYY/MM/DD HH:mm:ss"
                      showTodayButton
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      // variant="inline"
                      size="small"
                      label="To:"
                      // ampm={false}
                      defaultValue={moment(toDt)}
                      onChange={handleToDateTimeChange}
                      onError={console.log}
                      format="YYYY/MM/DD HH:mm:ss"
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
                      bottom: 100,
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
      </Container>
    );
  }

PowerLoadsHistoryForm.propTypes = {
  asutpReses: PropTypes.arrayOf(
    PropTypes.shape({
      Name: PropTypes.string,
      Caption: PropTypes.string,
      PSs: PropTypes.array,
    })
  ),  

  paramValues: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      dt: PropTypes.string,
      qd: PropTypes.string,
    })
  ),
  onReloadReses: PropTypes.func,
  onReloadParamValues: PropTypes.func,
};
