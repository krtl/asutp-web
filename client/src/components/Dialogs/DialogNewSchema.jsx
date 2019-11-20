import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

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

export default function MaxWidthDialog(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleNameChange = event => {
    setName(event.target.value);
  };

  const handleCaptionChange = event => {
    setCaption(event.target.value);
  };

  const handleDescriptionChange = event => {
    setDescription(event.target.value);
  };

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    // setOpen(false);
    props.onClose("dismiss");
  };

  const handleOk = () => {
    if (name !== "" && caption !== "") {
      // setOpen(false);
      props.onClose({ name, caption, description });
    }
  };

  if (props.open !== open) {
    setOpen(props.open);
  }

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
        <DialogTitle id="max-width-dialog-title">New schema</DialogTitle>
        <DialogContent>
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                fullWidth
                onChange={handleNameChange}
              />
              <TextField
                autoFocus
                margin="dense"
                id="caption"
                label="Caption"
                fullWidth
                onChange={handleCaptionChange}
              />
              <TextField
                autoFocus
                margin="dense"
                id="description"
                label="Description"
                fullWidth
                onChange={handleDescriptionChange}
              />
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
