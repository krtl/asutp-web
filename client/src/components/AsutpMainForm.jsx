import React from "react";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';



class AsutpMainForm extends React.Component {
  componentDidMount() {
    this.props.onReloadAsutpMainForm();
  }


  render() {

    let paramCaption = "";
    let paramValue = "";
   

    for (let k = 0; k < this.props.params.length; k++) {
      const param = this.props.params[k];

      for (let z = 0; z < this.props.paramValues.length; z += 1) {
        const locParamValue = this.props.paramValues[z];
        if (locParamValue.paramName === param.Name) {
          paramCaption = param.Caption;
          paramValue = locParamValue.value;
          break;
        }
      }
    }


    return (
      <Container maxWidth="sm">        
        <Box       
          sx={{
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              minHeight:"50vh"
              }}>
          <Stack spacing={2} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {paramCaption}
              </Typography>
              <Typography variant="h1" gutterBottom >
                {paramValue}
              </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }
}

AsutpMainForm.propTypes = {
  params: PropTypes.array.isRequired,
  paramValues: PropTypes.array.isRequired,
  onReloadAsutpMainForm: PropTypes.func,
  history: PropTypes.object.isRequired
};

export default AsutpMainForm;
