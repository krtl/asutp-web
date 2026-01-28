import { useEffect } from 'react';
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import RaisedButton from "@mui/material/Button";
// import SelectField from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export default function SystemServiceForm(props) {

useEffect(() => {
       props.onReloadCollisions();
  }, []);


const handleReloadCollisionsClick = () => {
    props.onReloadCollisions();
  };
  

 return (
      <Container>
        <Stack spacing={1} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" component="h6">
              Collisions
            </Typography>
            <RaisedButton onClick={handleReloadCollisionsClick}>
              Reload
            </RaisedButton>
        </Stack>

              <TableContainer>
                <Table size="small" padding="none">
                  <TableHead></TableHead>
                  <TableBody>
                    {props.collisions.map((value, index) => (
                      <TableRow key={index}>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
      </Container>
    );
}


SystemServiceForm.propTypes = {
  collisions: PropTypes.arrayOf(PropTypes.string),
  onReloadCollisions: PropTypes.func,
};
