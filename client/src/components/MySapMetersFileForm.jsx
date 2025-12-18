import React from "react";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import TextField from 'material-ui/TextField';
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { Card, CardText } from "material-ui/Card";
import Typography from "@material-ui/core/Typography";


const styles = {
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 200,
  },
};



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
    this.props.onUploadSapMetersFile(input.files[0])
    }
    
  }


  render() {

    return (
      <Container>
        <Card className="container">
          <CardText>
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
          </CardText>

          <CardText>
          <label for="fileinput">Файл для завантаження: </label>
          <input type="file" id="fileinput" name="fileinput" accept=".xlsx" style={{ width: 300 }} />
          <Button
            variant="outlined"
            onClick={this.handleUploadFileClick}
            >
            Завантажити
          </Button>            
          </CardText>

          <CardText>
          <Typography variant="h6" component="h6">
            {this.props.uploadResult}
          </Typography>        
          </CardText>

            {/*
            <FileUploadOutlined />
            <input
              styles={{display:"none"}}
              type="file"
              hidden
              onChange={handleUpload}
              name="[licenseFile]"
            />
            */}
        </Card>
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
