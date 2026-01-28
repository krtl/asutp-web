import React from "react";
import PropTypes from "prop-types";
import { useSelector } from 'react-redux'
import Auth from "../modules/Auth";
import MyServerStatusContainer from "../containers/MyServerStatusContainer";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormGroup from '@mui/material/FormGroup';
import MenuItem from "@mui/material/MenuItem";
// import Menu from "@mui/material/Menu";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import { NavLink } from "react-router-dom";
import { useColorScheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorIcon from "@mui/icons-material/Error";
import Badge from '@mui/material/Badge';

const moment = require("moment");

function MySpinner(props) {
  const isActive = props.isActive;
  if (isActive) {
    return <CircularProgress size={20} />;
  }
  return null;
}

const Base = ({ children }) => {
  const [anchorElAccountMenu, setAnchorElAccountMenu] = React.useState(null);
  const [anchorE1MainMenu, setAnchorE1MainMenu] = React.useState(null);
  const { mode, setMode } = useColorScheme();
  
  const locSocketStatus = useSelector(state => state.mainStatus.socketStatus);
  const locNowLoading = useSelector(state => state.mainStatus.nowLoading)
  const locCollisionsCount = useSelector(state => state.mainStatus.collisionsCount);
  

  const handleToggleDarkMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
    setAnchorElAccountMenu(null); // close menu
  };

  const handleMainMenuOpen = (event) => {
    setAnchorE1MainMenu(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setAnchorE1MainMenu(null);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorElAccountMenu(event.currentTarget);
  };

  // const handleMainMenuRoot = () => {
  //   setAnchorE1MainMenu(null);
  //   children.props.history.push(`/`);
  // };

  const handleMainMenuAlarm = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/airAlarm`);
  };

  const handleMainMenuStateOfCommunications = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/asutpCommunicationModel`);
  };

  const handleMainMenuDevicesOfflineReport = () => {
    setAnchorE1MainMenu(null);

    const options = {
      headers: {
        Authorization: `bearer ${Auth.getToken()}`
      }
    };
     fetch("/prj/getAsutpOfflineDevicesExcelReport", options)
      .then(response => response.blob())
      .then(blob => {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = `AsutpOfflineRep${moment().format("YYYY-MM-DD_HH_mm_ss")}.xlsx`;
          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();    
          a.remove();  //afterwards we remove the element again         
      });
  };  

  const handleMainMenuAsutpUsersReport = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/AsutpUsersReport`);
  };

  const handleMainMenuUsersReport = () => {
    setAnchorE1MainMenu(null);

    const options = {
      headers: {
        Authorization: `bearer ${Auth.getToken()}`
      }
    };
     fetch("/prj/getAsutpUsersExcelReport", options)
      .then(response => response.blob())
      .then(blob => {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = `AsutpUsersRep${moment().format("YYYY-MM-DD_HH_mm_ss")}.xlsx`;
          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();    
          a.remove();  //afterwards we remove the element again         
      });
  };    
  
  const handleMainMenuSapMeters = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/sapMeters`);
  };

  const handleMainMenuPowerLoads = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/powerLoads`);
  };

  const handleSignals = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/signals`);
  };  

  const handleMainMenuSoeConsumption = () => {
    setAnchorE1MainMenu(null);
    children.props.history.push(`/soeConsumption`);
  };
  
  
  // const handleMainNodeStateHistory = () => {
  //   setAnchorE1MainMenu(null);
  //   children.props.history.push(`/nodeStateHistory/{node_name}`);
  // };

  // const handleMainMenuSystemService = () => {
  //   setAnchorE1MainMenu(null);
  //   children.props.history.push(`/systemService`);
  // };

  // const handleMainMenuUserActions = () => {
  //   setAnchorE1MainMenu(null);
  //   children.props.history.push(`/userActions`);
  // };

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

  const handleCollisionsCountClick = event => {
    // window.open(`/systemService`, "_blank");
    children.props.history.push(`/systemService`);
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
                // className={classes.menuButton}
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
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuList>
                  <MenuItem onClick={handleMainMenuAlarm}>Повітряна тривога</MenuItem>
                  <MenuItem disabled={!Auth.canSeeReports()} onClick={handleMainMenuStateOfCommunications}>Стан комунікацій АСУТП</MenuItem>
                  <MenuItem disabled={!Auth.canSeeReports()} onClick={handleMainMenuDevicesOfflineReport}>Завантажити звіт "Відсутній зв'язок АСУТП"</MenuItem>
                  <MenuItem disabled={!Auth.canSeeReports()} onClick={handleMainMenuAsutpUsersReport}>Користувачі АСУТП</MenuItem>
                  <MenuItem disabled={!Auth.canSeeReports()} onClick={handleMainMenuUsersReport}>Завантажити звіт "Користувачі АСУТП"</MenuItem>
                  <MenuItem disabled={!Auth.canLoadSapMeters()} onClick={handleMainMenuSapMeters}>Лічильники з САП</MenuItem>
                  <MenuItem disabled={!Auth.canSeeReports()}  onClick={handleMainMenuPowerLoads}>Навантаження</MenuItem>
                  <MenuItem disabled={!Auth.canSeeReports()}  onClick={handleSignals}>Сигнали</MenuItem>
                  <MenuItem onClick={handleMainMenuSoeConsumption}>Споживання СОЕ</MenuItem>
                  {/*
                  <MenuItem onClick={handleMainMenuRoot}>Schema</MenuItem>
                  <MenuItem onClick={handleMainNodeStateHistory}>Node State History</MenuItem>
                  <MenuItem onClick={handleMainMenuSystemService}>System Service</MenuItem>
                  <MenuItem onClick={handleMainMenuUserActions}>User Actions</MenuItem>
                  <MenuItem onClick={handleMainMenuClose}>Setup</MenuItem>
                  */} 
                </MenuList>
              </Popover>
            </div>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <NavLink to="/">АСУТП</NavLink>
          </Typography>

          {(Auth.canSeeServerStatus() && (locCollisionsCount > 0)) && (
              <IconButton
                size="small"
                color="secondary"
                aria-label="collision"
                onClick={handleCollisionsCountClick}
              >
                <Badge badgeContent={locCollisionsCount} color="secondary">
                <ErrorIcon />
                </Badge>          
              </IconButton>
          )}

          <MyServerStatusContainer history={children.props.history} />

              <MySpinner isActive={locNowLoading} />

              <Tooltip title={`socket: ${locSocketStatus}`}>
                  <IconButton
                          aria-label="account of current user"
                          aria-controls="menu-appbar"
                          aria-haspopup="true"
                          // onClick={handleToggleDarkMode}
                          color="inherit"
                        >
                          {locSocketStatus === "connected" ? (
                          <PowerIcon />
                                  ) : (
                          <PowerOffIcon />
                                    )}
                  </IconButton>
              </Tooltip>


              <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleToggleDarkMode}
                  color="inherit"
                >
                  {mode === "dark" ? (
                  <DarkModeIcon />
                          ) : (
                  <LightModeIcon />
                            )}
                </IconButton>
              </Tooltip>

          {Auth.isUserAuthenticated() ? (
            <div>
              <Tooltip title={Auth.getLoginName()}>
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
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={accountMenuOpen}
                onClose={handleAccountMenuClose}
              >
                <MenuList>
                  <MenuItem onClick={handleAccountMenuProfile}>Profile</MenuItem>
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
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
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
  children: PropTypes.object.isRequired,
};

export default Base;
