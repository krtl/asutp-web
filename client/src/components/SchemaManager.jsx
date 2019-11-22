import React from "react";
import PropTypes from "prop-types";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import DialogNewSchema from "./Dialogs/DialogNewSchema";
import DialogAreYouSure from "./Dialogs/DialogAreYouSure";
import MyRegionSchemaContainer from "../containers/MyRegionSchemaContainer";

const itemShemaNew = "New";
const itemShemaDelete = "Delete";
const itemReloadSchemas = "ReloadSchemas";
const itemLoadSchema = "LoadSchema";
const actionMenuItems = [
  itemLoadSchema,
  itemReloadSchemas,
  itemShemaNew,
  itemShemaDelete
];

const styles = {
  schemaComboWidth: {
    width: 350
  },
  actionComboWidth: {
    width: 200
  }
};

export default class SchemaManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialogNewSchema: false,
      openDialogAreYouSure: false,
      selectedSchema: undefined,
      loadedSchema: undefined
    };
    this.handleSelectedSchemaChange = this.handleSelectedSchemaChange.bind(
      this
    );
    this.handleActionChange = this.handleActionChange.bind(this);
    this.handleDialogNewSchemaClose = this.handleDialogNewSchemaClose.bind(
      this
    );
    this.handleDialogAreYouSureClose = this.handleDialogAreYouSureClose.bind(
      this
    );
  }

  handleSelectedSchemaChange(event, index, value) {
    this.setState({ selectedSchema: value });
    this.setState({ loadedSchema: value });
  }

  handleActionChange(event, index, value) {
    switch (value) {
      case itemLoadSchema: {
        if (this.state.selectedSchema) {
          this.setState({ loadedSchema: this.state.selectedSchema });
        }
        break;
      }
      case itemReloadSchemas: {
        this.props.onReloadSchemas();
        break;
      }
      case itemShemaNew: {
        this.setState({
          openDialogNewSchema: true
        });
        break;
      }
      case itemShemaDelete: {
        if (this.state.selectedSchema) {
          this.setState({
            openDialogAreYouSure: true
          });
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  handleDialogNewSchemaClose(data) {
    this.setState({ openDialogNewSchema: false });
    if (data !== "dismiss") {
      let s = JSON.stringify(data);
      this.props.onAddNewCustomSchema(s);
    }
  }

  handleDialogAreYouSureClose(data) {
    this.setState({ openDialogAreYouSure: false });
    if (data !== "dismiss" && this.state.selectedSchema) {
      this.props.onDeleteCustomSchema(this.state.selectedSchema.name);
    }
  }

  render() {
    let selectedSchemaName = this.state.selectedSchema
      ? this.state.selectedSchema.name
      : "";

    return (
      <div>
        <DialogNewSchema
          open={this.state.openDialogNewSchema}
          onClose={this.handleDialogNewSchemaClose}
        />
        <DialogAreYouSure
          open={this.state.openDialogAreYouSure}
          text={`want to delete schema "${selectedSchemaName}" ?`}
          onClose={this.handleDialogAreYouSureClose}
        />
        <div>
          <SelectField
            floatingLabelText="Schemas:"
            value={this.state.selectedSchema}
            onChange={this.handleSelectedSchemaChange}
            style={styles.schemaComboWidth}
          >
            {this.props.schemas.map(schema => (
              <MenuItem
                key={schema.name}
                value={schema}
                primaryText={schema.caption}
                secondaryText={schema.name}
              />
            ))}
          </SelectField>
          <SelectField
            floatingLabelText="Action:"
            value={undefined}
            onChange={this.handleActionChange}
            style={styles.actionComboWidth}
          >
            {actionMenuItems.map(item => (
              <MenuItem key={item} value={item} primaryText={item} />
            ))}
          </SelectField>
        </div>
        <MyRegionSchemaContainer
          schema={this.state.loadedSchema}
          history={this.props.history}
        />
      </div>
    );
  }
}

SchemaManager.propTypes = {
  schemas: PropTypes.array.isRequired,
  onReloadSchemas: PropTypes.func.isRequired,
  onAddNewCustomSchema: PropTypes.func.isRequired,
  onDeleteCustomSchema: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};
