import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles(theme => ({
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content"
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 220
  },
  formControlLabel: {
    marginTop: theme.spacing(1)
  }
}));

export default function DialogAddNode(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [currentRegion, setCurrentRegion] = React.useState();
  const [currentNodes, setCurrentNodes] = React.useState([]);
  const [newNode, setNewNode] = React.useState();

  const handleRegionChange = event => {
    setCurrentRegion(event.target.value);
    if (event.target.value) {
      setCurrentNodes(event.target.value.nodes);
    } else {
      setCurrentNodes([]);
    }
    setNewNode();
  };

  const handleNodeChange = event => {
    setNewNode(event.target.value);
  };

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    // setOpen(false);
    props.onClose("dismiss");
  };

  const handleOk = () => {
    if (newNode) {
      // setOpen(false);
      props.onClose(newNode.name);
    }
  };

  if (props.open !== open) {
    setOpen(props.open);
  }

  const regionItems = [];
  const nodeItems = [];

  regionItems.push(
    <MenuItem key={0} value={undefined}>
      {"none"}
    </MenuItem>
  );

  props.regions.forEach(region => {
    regionItems.push(
      <MenuItem key={region.name} value={region}>
        {`${region.name}(${region.caption})`}
      </MenuItem>
    );
  });

  nodeItems.push(
    <MenuItem key={0} value={undefined}>
      {"none"}
    </MenuItem>
  );

  currentNodes.forEach(node => {
    nodeItems.push(
      <MenuItem key={node.name} value={node}>
        {`${node.name}(${node.caption})`}
      </MenuItem>
    );
  });

  return (
    <React.Fragment>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        test
      </Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">{`Add node for '${props.editedSchemaName}'`}</DialogTitle>
        <DialogContent>
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <DialogContentText>Region:</DialogContentText>
              <Select value={currentRegion} onChange={handleRegionChange}>
                {regionItems}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <DialogContentText>Node:</DialogContentText>
              <Select value={newNode} onChange={handleNodeChange}>
                {nodeItems}
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button autoFocus color="primary" onClick={handleOk}>
            Ok
          </Button>
          <Button color="primary" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
