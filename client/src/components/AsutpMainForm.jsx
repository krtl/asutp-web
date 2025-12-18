import React from "react";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import { Card, CardText } from "material-ui/Card";
import Typography from "@material-ui/core/Typography";

const styles = {
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 200,
  },
};


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
        <Card className="container" >
          <CardText>
          <Typography variant="h6" component="h6">
            {paramCaption}
          </Typography>
          <Typography variant="h1" component="h1" >
          {paramValue}
          </Typography>        
          </CardText>
        </Card>
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
