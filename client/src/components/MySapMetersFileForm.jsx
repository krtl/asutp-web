import React from "react";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from '@mui/material/Stack';



export default class MySapMetersFileForm extends React.Component {
  constructor(props) {
    super(props);



    this.state = {
    };

    //this.handleFromDateTimeChange = this.handleReloadLastFileNameClick.bind(this);
    this.handleUploadFileClick = this.handleUploadFileClick.bind(this);
    this.handleReloadLastFileNameClick = this.handleReloadLastFileNameClick.bind(
      this
    );
  }

  componentDidMount() {
    this.props.onReloadLastFileName();
  }

  handleReloadLastFileNameClick() {
    this.props.onReloadLastFileName();
  }

  // handleFromDateTimeChange(value) {
  //   this.setState({ fromDt: value });
  // }

  handleUploadFileClick() {

    const input = document.getElementById('fileinput');

    if (input.files.length > 0) {
    if (input.files.length > 0) {
    this.props.onUploadSapMetersFile(input.files[0])
    }
    
  }


  render() {

    return (
      <Container>
        <Stack spacing={3} direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" component="h6">
            {"Поточний файл саповських лічильників:"}
          </Typography>
          <Typography variant="h6" component="h6">
            {this.props.lastFileName}
          </Typography>        
          <Button
              variant="outlined"
              onClick={this.handleReloadLastFileNameClick}
              >
              Оновити
          </Button>            

          <label htmlFor="fileinput">Файл для завантаження: </label>
          <input type="file" id="fileinput" name="fileinput" accept=".xlsx" style={{ width: 300 }} />
          <Button
            variant="outlined"
            onClick={this.handleUploadFileClick}
            >
            Завантажити
          </Button>            

          <Typography variant="h6" component="h6">
            {this.props.uploadResult}
          </Typography>        
        </Stack>
      </Container>
    );
  }
}

MySapMetersFileForm.propTypes = {
  lastFileName: PropTypes.string.isRequired,
  uploadResult: PropTypes.string.isRequired,
  onReloadLastFileName: PropTypes.func,
  onUploadSapMetersFile: PropTypes.func,
};
