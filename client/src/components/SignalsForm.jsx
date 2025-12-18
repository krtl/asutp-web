import React from "react";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from 'material-ui/TextField';
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { Card, CardText } from "material-ui/Card";
import Typography from "@material-ui/core/Typography";
import Select from '@material-ui/core/Select';
import { styled } from '@material-ui/core/styles';


const MyButton = styled(Button)({
  margin: '30px 30px',
});


export default class SignalsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRes: "",
      selectedPs: "",
      includeTS: true,
      includeTV: true,
      includeTU: true,
      forScadaSkat: false
    };

    this.handleDownloadSingalsReportFileClick = this.handleDownloadSingalsReportFileClick.bind(this);
    this.handleResChange = this.handleResChange.bind(this);
    this.handlePsChange = this.handlePsChange.bind(this);  
    this.handleCheckboxTSChange = this.handleCheckboxTSChange.bind(this);  
    this.handleCheckboxTVChange = this.handleCheckboxTVChange.bind(this);  
    this.handleCheckboxTUChange  = this.handleCheckboxTUChange.bind(this);
    this.handleUploadFileClick = this.handleUploadFileClick.bind(this);
    this.handleCheckboxForScadaScatChange = this.handleCheckboxForScadaScatChange.bind(this);

  }

  componentDidMount() {
    this.props.onReloadReses();
  }

  handleDownloadSingalsReportFileClick() {
  if (this.state.selectedPs !== "") {
      this.props.onDowloadSignalReport(this.state.selectedPs, this.state.includeTS, this.state.includeTV, this.state.includeTU, this.state.forScadaSkat);
    }
  }
  
  handleResChange(event) {
    this.setState({ selectedRes: event.target.value });    
  }

  handlePsChange(event) {
    this.setState({ selectedPs: event.target.value });        
  }

  handleCheckboxTSChange(event) {
    this.setState({ includeTS: event.target.checked });
  }

  handleCheckboxTVChange(event) {
    this.setState({ includeTV: event.target.checked });
  }

  handleCheckboxTUChange(event) {
    this.setState({ includeTU: event.target.checked });
  }

  handleCheckboxForScadaScatChange(event) {
    this.setState({ forScadaSkat: event.target.checked });
  }

  handleUploadFileClick() {
    const input = document.getElementById('fileinput');

    if (input.files.length > 0) {
    this.props.onUploadSignalsFile(input.files[0])
    }
  }
  

  render() {

    let locResOptions = [];
    let locPsOptions = [];

    locResOptions.push(
          <option
            value={""}
          >
            {""}
          </option>);    
    locPsOptions.push(
          <option
            value={""}
          >
            {""}
          </option>);

    for (let i = 0; i < this.props.asutpReses.length; i++) {
      const res = this.props.asutpReses[i];
            locResOptions.push(
          <option
            value={res.Name}
          >
            {res.Caption}
          </option>);
      if (res.Name === this.state.selectedRes) {
        for (let j = 0; j < res.PSs.length; j++) {
          const ps = res.PSs[j];
          locPsOptions.push(
          <option
            value={ps.Uid}
          >
            {ps.Caption}
          </option>);
        }
      }
    }
    
    return (
      <Container>
        <Card className="container">
          <CardText>
          <Typography variant="h6" component="h6">
            {"Сигнали АСУТП"}
          </Typography>
          <div>
            <Select
              native
              value={this.state.selectedRes}
              onChange={this.handleResChange}
              inputProps={{
                name: 'res',
                id: 'res',
              }}
            >
              {locResOptions}
            </Select>  
          </div>
          <div>
            <Select
              native
              value={this.state.selectedPs}
              onChange={this.handlePsChange}
              inputProps={{
                name: 'ps',
                id: 'ps',
              }}
            >
              {locPsOptions}
            </Select>  
          </div>
            <FormControlLabel label="ТС"  control={
                <Checkbox color="primary" checked={this.state.includeTS} onChange={this.handleCheckboxTSChange}/>
                }
            />
            <FormControlLabel label="ТВ"  control={
                <Checkbox color="primary" checked={this.state.includeTV} onChange={this.handleCheckboxTVChange}/>
                }
            />
            <FormControlLabel label="ТУ"  control={
                <Checkbox color="primary" checked={this.state.includeTU} onChange={this.handleCheckboxTUChange}/>
                }
            />                        
            <FormControlLabel label="Для СКАДА СКАТу"  control={
                <Checkbox color="primary" checked={this.state.forScadaSkat} onChange={this.handleCheckboxForScadaScatChange}/>
                }
            />                        
          <MyButton
              variant="outlined"
              onClick={this.handleDownloadSingalsReportFileClick}
              >
              Завантажити (download)
          </MyButton>            
          </CardText>

          <CardText>
          <label for="fileinput">Файл для завантаження: </label>
          <input type="file" id="fileinput" name="fileinput" accept=".xlsx" style={{ width: 400 }} />
          <Button
            variant="outlined"
            onClick={this.handleUploadFileClick}
            >
            Завантажити (upload)
          </Button>            
          </CardText>

          <CardText>
          <Typography variant="caption">
            {this.props.uploadResult}
          </Typography>        
          </CardText>          
        </Card>
      </Container>
    );
  }
}

SignalsForm.propTypes = {
  asutpReses: PropTypes.arrayOf(
    PropTypes.shape({
      Name: PropTypes.string,
      Caption: PropTypes.string,
      PSs: PropTypes.array,
    })
  ),  
  onReloadReses: PropTypes.func,
  onDowloadSignalReport: PropTypes.func,
  uploadResult: PropTypes.string.isRequired,
  onUploadSignalsFile: PropTypes.func,  
};
