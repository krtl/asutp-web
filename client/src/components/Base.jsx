import React from "react";
import PropTypes from "prop-types";
import Auth from "../modules/Auth";
import MainStatus from "./MyServerStatus/MainStatus";

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Base = ({ children }) => {
  const classes = useStyles();
  const [anchorElAccountMenu, setAnchorElAccountMenu] = React.useState(null);
  const [anchorE1MainMenu, setAnchorE1MainMenu] = React.useState(null);
  const accountMenuOpen = Boolean(anchorElAccountMenu);
  const mainMenuOpen = Boolean(anchorE1MainMenu);

  const handleMainMenuOpen = event => {
    setAnchorE1MainMenu(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setAnchorE1MainMenu(null);
  };

  const handleAccountMenuOpen = event => {
    setAnchorElAccountMenu(event.currentTarget);
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
  }  

  return (
    <div>
      <AppBar position="static">
          <Toolbar>
          {Auth.isUserAuthenticated() && (
                          <div>

            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMainMenuOpen}
            >
              <MenuIcon />
            </IconButton>
                            <Menu
                            id="menu-appbar"
                            anchorEl={anchorE1MainMenu}
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }}
                            open={mainMenuOpen}
                            onClose={handleMainMenuClose}
                          >
                            <MenuItem onClick={handleMainMenuClose}>Root</MenuItem>
                            <MenuItem onClick={handleMainMenuClose}>Collisions</MenuItem>            
                            <MenuItem onClick={handleMainMenuClose}>Setup</MenuItem>            
                          </Menu>
          
                          </div>
            
            )}
            <Typography variant="h6" className={classes.title}>
              ASUTP
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

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElAccountMenu}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={accountMenuOpen}
                  onClose={handleAccountMenuClose}
                >
                  <MenuItem onClick={handleAccountMenuProfile}>Profile</MenuItem>
                  <MenuItem onClick={handleAccountMenuLogout}>Log out</MenuItem>            
                </Menu>
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
      
                      <Menu
                        id="menu-appbar"
                        anchorEl={anchorElAccountMenu}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        open={accountMenuOpen}
                        onClose={handleAccountMenuClose}
                      >
                        <MenuItem onClick={handleAccountMenuLogin}>login</MenuItem>
                        <MenuItem onClick={handleAccountMenuSignup}>signup</MenuItem>            
                      </Menu>
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
}

Base.propTypes = {
  children: PropTypes.object.isRequired
};

export default Base;
