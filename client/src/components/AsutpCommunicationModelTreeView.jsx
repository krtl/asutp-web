import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import LinkIcon from "@material-ui/icons/Link";
import LinkOffIcon from "@material-ui/icons/LinkOff";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import BarChartIcon from "@material-ui/icons/BarChart";
import IconButton from "@material-ui/core/IconButton";

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    "&:hover": {
      backgroundColor: "transparent",
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },

  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  group: {
    marginLeft: 0,
    "& $content": {
      paddingLeft: theme.spacing(2),
    },
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: "inherit",
    color: "inherit",
  },
  labelRoot: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1,
  },
  buttonHistiry: {
    marginRight: theme.spacing(2),
  },
}));

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    historyHref,
    color,
    bgColor,
    ...other
  } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
          {historyHref && (
            <IconButton
              aria-label="delete"
              className={classes.buttonHistiry}
              size="small"
              href={historyHref}
            >
              <BarChartIcon fontSize="inherit" />
            </IconButton>
          )}
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  historyHref: PropTypes.string,
};

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

export default function AsutpCommunicationModelTreeView(props) {
  const classes = useStyles();
  let locExpanded = [];
  let locSelected = "";
  let treeItems = [];

  for (let i = 0; i < props.asutpRESes.length; i++) {
    const res = props.asutpRESes[i];
    let connectionTreeItems = [];
    for (let j = 0; j < res.Devices.length; j++) {
      const device = res.Devices[j];

      let paramTreeItems = [];
      let connectedValue = "";
      let qualityValue = "";
      let historyHref = "";

      for (let k = 0; k < device.Params.length; k++) {
        const param = device.Params[k];
        if (param.Name === props.lastHistoryParam) {
          locSelected = device.Name;
          locExpanded.push(res.Name);
        }

        for (let z = 0; z < props.paramValues.length; z += 1) {
          const locParamValue = props.paramValues[z];
          if (locParamValue.paramName === param.Name) {
            if (param.Name.endsWith("_IsOnline")) {
              connectedValue = locParamValue.value;
            }
            if (param.Name.endsWith("_CommunicationQuality")) {
              qualityValue = locParamValue.value.toString();
              historyHref = `/paramHistory/${param.Name}`;
            }
            break;
          }
        }
      }
      let icon = LinkOffIcon;
      if (connectedValue) {
        icon = LinkIcon;
      }

      connectionTreeItems.push(
        <StyledTreeItem
          key={device.Name}
          nodeId={device.Name}
          labelText={`${device.Caption} (${device.Name})`}
          labelIcon={icon}
          labelInfo={qualityValue}
          historyHref={historyHref}
          // color="#3c8039"
          // bgColor="#e6f4ea"
        >
          {paramTreeItems}
        </StyledTreeItem>
      );
    }

    let resIcon = LinkOffIcon;
    if (res.ConnectionStatus) {
      resIcon = LinkIcon;
    }

    treeItems.push(
      <StyledTreeItem
        key={res.Name}
        nodeId={res.Name}
        labelText={`${res.Caption}(${res.Name}) ${res.ConnectionStatus} `}
        labelIcon={resIcon}
      >
        {connectionTreeItems}
      </StyledTreeItem>
    );
  }

  let loading = props.lastHistoryParam != null;
  if (props.asutpRESes.length > 0) {
    loading = false;
  }

  if (loading) {
    return (
      <Typography variant="h6" className={classes.title}>
        Loading...
      </Typography>
    );
  } else {
    return (
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={locExpanded}
        defaultSelected={locSelected}
        // expanded={true}
        // onNodeToggle={this.handleChange}
        defaultEndIcon={<div style={{ width: 24 }} />}
      >
        {treeItems}
      </TreeView>
    );
  }
}
