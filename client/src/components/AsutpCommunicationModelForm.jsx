import React from "react";
import PropTypes from "prop-types";

import Container from "@material-ui/core/Container";
import AsutpCommunicationModelTreeView from "./AsutpCommunicationModelTreeView";

export default class AsutpCommunicationModelForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, nodes) {
    this.setState({ expanded: nodes });
  }

  componentDidMount() {
    // this.props.onReloadCollisions();
    // this.props.onReloadBlockedParams();
    this.props.onReloadAsutpCommunicationModel();
  }

  render() {
    return (
      <Container maxWidth="sm">
        <AsutpCommunicationModelTreeView
          asutpRESes={this.props.asutpRESes}
          paramValues={this.props.paramValues}
          // history={this.props.history}
        />
      </Container>
    );
  }
}

AsutpCommunicationModelForm.propTypes = {
  asutpRESes: PropTypes.arrayOf(
    PropTypes.shape({
      Name: PropTypes.string,
      Caption: PropTypes.string,
      ConnectionStatus: PropTypes.string,
      Devices: PropTypes.array,
    })
  ),
  paramValues: PropTypes.array.isRequired,
  onReloadAsutpCommunicationModel: PropTypes.func,
  history: PropTypes.object.isRequired
};
