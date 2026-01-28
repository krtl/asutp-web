import * as React from 'react';
// import React from "react";
// import PropTypes from "prop-types";

import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import BarChartIcon from "@mui/icons-material/BarChart";
import IconButton from "@mui/material/IconButton";
import Box from '@mui/material/Box';

import "./AsutpCommunicationModelTreeView.css";

import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { useSimpleTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { styled } from '@mui/material/styles';
import {
  TreeItemContent,
  TreeItemIconContainer,
  TreeItemRoot,
  TreeItemGroupTransition,
} from '@mui/x-tree-view/TreeItem';
import { useTreeItem } from '@mui/x-tree-view/useTreeItem';
import { TreeItemProvider } from '@mui/x-tree-view/TreeItemProvider';
import { TreeItemIcon } from '@mui/x-tree-view/TreeItemIcon';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const CustomTreeItemRoot = styled(TreeItemRoot)(({ theme, ownerState }) => ({
  '--tree-view-color': ownerState.color,
  '--tree-view-bg-color': ownerState.bgColor,
  color: (theme.vars || theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    '--tree-view-color': ownerState.colorForDarkMode,
    '--tree-view-bg-color': ownerState.bgColorForDarkMode,
  }),
}));

const CustomTreeItemContent = styled(TreeItemContent)(({ theme }) => ({
  marginBottom: theme.spacing(0.1),
  color: (theme.vars || theme).palette.text.secondary,
  borderRadius: theme.spacing(2),
  paddingTop: 0,
  paddingBottom: 0,
  paddingRight: theme.spacing(1),
  paddingLeft: `calc(${theme.spacing(1)} + var(--TreeView-itemChildrenIndentation) * var(--TreeView-itemDepth))`,
  fontWeight: theme.typography.fontWeightMedium,
  '&[data-expanded]': {
    fontWeight: theme.typography.fontWeightRegular,
  },
  '&:hover': {
    backgroundColor: (theme.vars || theme).palette.action.hover,
  },
  '&[data-focused], &[data-selected], &[data-selected][data-focused]': {
    backgroundColor: `var(--tree-view-bg-color, ${(theme.vars || theme).palette.action.selected})`,
    color: 'var(--tree-view-color)',
  },
}));

const CustomTreeItemIconContainer = styled(TreeItemIconContainer)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const {
    id,
    itemId,
    labelText,
    disabled,
    children,
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    historyHref,
    colorForDarkMode,
    bgColorForDarkMode,
    ...other
  } = props;

  const {
    getContextProviderProps,
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem({ id, itemId, children, labelText, disabled, rootRef: ref });

  const treeItemRootOwnerState = {
    color,
    bgColor,
    colorForDarkMode,
    bgColorForDarkMode,
  };

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <CustomTreeItemRoot
        {...getRootProps(other)}
        ownerState={treeItemRootOwnerState}
      >
        <CustomTreeItemContent {...getContentProps()}>
          <CustomTreeItemIconContainer {...getIconContainerProps()}>
            <TreeItemIcon status={status} />
          </CustomTreeItemIconContainer>
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
            <Typography variant="caption" color="inherit">
              {labelText}
            </Typography>            
            <Typography
              {...getLabelProps({
                variant: 'body2',
                sx: { display: 'flex', fontWeight: 'inherit', flexGrow: 1 },
              })}
            />
            <Typography variant="caption" color="inherit">
              {labelInfo}
            </Typography>
            {historyHref && (
            <IconButton
              // aria-label="delete"
              // className={classes.buttonHistiry}
              size="small"
              href={historyHref}
            >
              <BarChartIcon fontSize="inherit" />
            </IconButton>
          )}
          </Box>
        </CustomTreeItemContent>
        {children && <TreeItemGroupTransition {...getGroupTransitionProps()} />}
      </CustomTreeItemRoot>
    </TreeItemProvider>
  );
});

function EndIcon() {
  return <div style={{ width: 24 }} />;
}

 export default function AsutpCommunicationModelTreeView(props) {
  // const classes = useStyles();
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

      for (let k = 0; k < device.CommunicationParams.length; k++) {
        const param = device.CommunicationParams[k];
        if (param.Name === props.lastHistoryParam) {
          locSelected = `${res.Name}_${device.Name}`;
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
        <CustomTreeItem
          key={`${res.Name}_${device.Name}`}
          itemId={`${res.Name}_${device.Name}`}
          labelText={`${device.Caption} (${device.Name})`}
          labelIcon={icon}
          labelInfo={qualityValue}
          historyHref={historyHref}
          // color="#3c8039"
          // bgColor="#e6f4ea"
        >
          {paramTreeItems}
        </CustomTreeItem>
      );
    }

    for (let z = 0; z < props.paramValues.length; z += 1) {
      const locParamValue = props.paramValues[z];
      if (locParamValue.paramName === res.Name) {
        if (locParamValue.value > 0) {
          res.ConnectionStatus = "Connected";
        } else {
          res.ConnectionStatus = "Error";
        }
        break;
      }
    }

    let resIcon = LinkOffIcon;
    if (res.ConnectionStatus === "Connected") {
      resIcon = LinkIcon;
    }

    treeItems.push(
      <CustomTreeItem
        key={res.Name}
        itemId={res.Name}
        labelText={`${res.Caption}(${res.Name}) ${res.ConnectionStatus} `}
        labelIcon={resIcon}
      >
        {connectionTreeItems}
      </CustomTreeItem>
    );
  }

  let loading = props.lastHistoryParam != null;
  if (props.asutpRESes.length > 0) {
    loading = false;
  }

      const apiRef = useSimpleTreeViewApiRef();
  // const handleButtonClick = (event: React.SyntheticEvent) => {
    apiRef.current?.focusItem(null, locSelected);
  // };

  if (loading) {
    return (
      <Box className='container'
          sx={{
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              minHeight:"75vh"
              }}>     
      <Typography variant="h6" >
        Loading...
      </Typography>
    </Box>
    );
  } else {

     return (
      <div>
       <SimpleTreeView
        // className={classes.root}
        // aria-label="customized"
        // defaultCollapseIcon={<ExpandMoreIcon />}
        // defaultExpandIcon={<ChevronRightIcon />}
        // defaultExpanded={locExpanded}
        // defaultSelected={locSelected}
        // // expanded={true}
        // // onNodeToggle={this.handleChange}
        // defaultEndIcon={<div style={{ width: 24 }} />}

      defaultExpandedItems={locExpanded}
      defaultSelectedItems={locSelected}
      slots={{
        expandIcon: ArrowRightIcon,
        collapseIcon: ArrowDropDownIcon,
        endIcon: EndIcon,
      }}
      sx={{ flexGrow: 1, maxWidth: 600 }}
       itemChildrenIndentation={20}
      >
        {treeItems}
      </SimpleTreeView>
      </div>
     );
   }
 }
