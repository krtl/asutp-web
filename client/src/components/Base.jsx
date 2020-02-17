import React from "react";
import PropTypes from "prop-types";
import Auth from "../modules/Auth";
import MainStatus from "./MyServerStatus/MainStatus";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from "@material-ui/core/MenuItem";
// import Menu from "@material-ui/core/Menu";
import MenuList from "@material-ui/core/MenuList";
import Popover from "@material-ui/core/Popover";
import { NavLink } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

const Base = ({ children }) => {
  const classes = useStyles();
  const [anchorElAccountMenu, setAnchorElAccountMenu] = React.useState(null);
  const [anchorE1MainMenu, setAnchorE1MainMenu] = React.useState(null);

  const handleMainMenuOpen = event => {
    setAnchorE1MainMenu(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setAnchorE1MainMenu(null);
  };

  const handleAccountMenuOpen = event => {
    setAnchorElAccountMenu(event.currentTarget);
  };

  const handleMainMenuRoot = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/`);
  };

  const handleMainMenuSystemService = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/systemService`);
  };

  const handleAccountMenuClose = () => {
    setAnchorElAccountMenu(null);
  };

  const handleAccountMenuLogout = () => {
    setAnchorElAccountMenu(null);
    children.props.history.push(`/logout`);
  };

  const handleAccountMenuProfile = () => {
    setAnchorElAccountMenu(null);
    children.props.history.push(`/logout`);
  };

  const handleAccountMenuLogin = () => {
    setAnchorElAccountMenu(null);
    children.props.history.push(`/login`);
  };

  const handleAccountMenuSignup = () => {
    setAnchorElAccountMenu(null);
    children.props.history.push(`/signup`);
  };

  const accountMenuOpen = Boolean(anchorElAccountMenu);
  const mainMenuOpen = Boolean(anchorE1MainMenu);
  const mainMenuId = mainMenuOpen ? "simple-popover" : undefined;
  const accountMenuId = accountMenuOpen ? "simple-popover" : undefined;

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          {Auth.isUserAuthenticated() && (
            <div>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMainMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Popover
                id={mainMenuId}
                open={mainMenuOpen}
                anchorEl={anchorE1MainMenu}
                onClose={handleMainMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
              >
                <MenuList>
                  <MenuItem onClick={handleMainMenuRoot}>Root</MenuItem>
                  <MenuItem onClick={handleMainMenuSystemService}>
                    System Service
                  </MenuItem>
                  <MenuItem onClick={handleMainMenuClose}>Setup</MenuItem>
                </MenuList>
              </Popover>
            </div>
          )}
          <Typography variant="h6" className={classes.title}>
            <NavLink to="/">ASUTP</NavLink>
          </Typography>
          <MainStatus history={children.props.history} />
          {Auth.isUserAuthenticated() ? (
            <div>
              <Tooltip title={Auth.getData()}>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleAccountMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>

              <Popover
                id={accountMenuId}
                anchorEl={anchorElAccountMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                open={accountMenuOpen}
                onClose={handleAccountMenuClose}
              >
                <MenuList>
                  <MenuItem onClick={handleAccountMenuProfile}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleAccountMenuLogout}>Log out</MenuItem>
                </MenuList>
              </Popover>
            </div>
          ) : (
            <div>
              <Tooltip title="Not logged in">
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleAccountMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>

              <Popover
                id={accountMenuId}
                anchorEl={anchorElAccountMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                open={accountMenuOpen}
                onClose={handleAccountMenuClose}
              >
                <MenuList>
                  <MenuItem onClick={handleAccountMenuLogin}>login</MenuItem>
                  <MenuItem onClick={handleAccountMenuSignup}>signup</MenuItem>
                </MenuList>
              </Popover>
            </div>
          )}
        </Toolbar>
      </AppBar>
      {/* <div className="top-bar">
        <div className="top-bar-left">
          <MainStatus history={children.props.history} />
        </div>        
      </div> */}

      {/* child component will be rendered here */}
      {children}
    </div>
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired
};

export default Base;
