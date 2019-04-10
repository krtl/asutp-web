import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Layer, Stage, Line } from 'react-konva';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText } from 'material-ui/Card';
import MySchemaNode from './MySchemaNode';
import {MyConsts} from '../modules/MyConsts';
import MyParams from './MyParams';
import MyParamDialog from './MyParamDialog'
import MyNodeConnectorDialog from './MyNodeConnectorDialog'



export default class MyPSScheme extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edited: false,
      stateChanged: false,

      openConnectionDialog: false,   

      openParamDialog: false,
      initialParamValue: 0,
      initialBlockRawValues: '',
      editedNodeName: '',
      editedParamName: ''

    };    

    this.handleLoadSchemeClick = this.handleLoadSchemeClick.bind(this);
    this.handleSaveSchemeClick = this.handleSaveSchemeClick.bind(this);
    this.handleResetSchemaClick = this.handleResetSchemaClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);

    this.handleParamDialogClose = this.handleParamDialogClose.bind(this);
    this.handleConnectionDialogClose = this.handleConnectionDialogClose.bind(this);

  }

  componentDidMount() {
    this.props.onLoadScheme(this.props.psName, true);
  }

  getCenterX(node) {
    switch (node.nodeType) {
      case MyConsts.NODE_TYPE_LEP: return MyConsts.NODE_LEP_X_OFFSET + MyConsts.NODE_LEP_WIDTH / 2;
      case MyConsts.NODE_TYPE_SEC2SECCONNECTOR: return MyConsts.NODE_PS_RADIUS;
      case MyConsts.NODE_TYPE_SECTION: return MyConsts.NODE_PS_RADIUS;
      case MyConsts.NODE_TYPE_SECTIONCONNECTOR: return MyConsts.NODE_PS_RADIUS;
      case MyConsts.NODE_TYPE_TRANSFORMER: return MyConsts.NODE_PS_RADIUS;
      default: return 0;
    }
  }

  getCenterY(node) {
    switch (node.nodeType) {
      case MyConsts.NODE_TYPE_LEP: return MyConsts.NODE_LEP_Y_OFFSET + MyConsts.NODE_LEP_HEIGHT / 2;
      case MyConsts.NODE_TYPE_SEC2SECCONNECTOR: return MyConsts.NODE_PS_RADIUS;
      case MyConsts.NODE_TYPE_SECTION: return MyConsts.NODE_LEP_Y_OFFSET + MyConsts.NODE_SECTION_HEIGHT / 2;
      case MyConsts.NODE_TYPE_SECTIONCONNECTOR: return MyConsts.NODE_PS_RADIUS;
      case MyConsts.NODE_TYPE_TRANSFORMER: return MyConsts.NODE_PS_RADIUS;
      default: return 0;
    }
  }

  getLines() {
    const result = [];
    if (this.props.wires) {
        for (let i = 0; i < this.props.wires.length; i += 1) {
          const locWire = this.props.wires[i];
          const locNode1 = this.props.nodes.find(node => node.name === locWire.nodeFrom);
          const locNode2 = this.props.nodes.find(node => node.name === locWire.nodeTo);
          if ((locNode1 !== undefined) && (locNode2 !== undefined)) {
            result.push(
              {
                name: this.props.wires[i].name,
                points: [ locNode1.x + this.getCenterX(locNode1), locNode1.y + this.getCenterY(locNode1),
                   locNode2.x + this.getCenterX(locNode2), locNode2.y + this.getCenterY(locNode2) ],
              });
          }
        }
      }
    return result;
  }

  getNodeByName(nodeName) {
    for(let i=0; i<this.props.nodes.length; i++) {
      let node = this.props.nodes[i];
      if(node.name === nodeName) {
        return node;
      }
    }
    return null;    
  }

  getParamByName(nodeName) {
    for(let i=0; i<this.props.params.length; i++) {
      let param = this.props.params[i];
      if(param.name === nodeName) {
        return param;
      }
    }
    return null;    
  }


  handleLoadSchemeClick() {
    this.props.onLoadScheme(this.props.psName, true);
  } 

  handleSaveSchemeClick() {
    if (this.state.edited) {
      let nodes = [];
      this.props.nodes.forEach((node) => {
        // if (node.changed !== undefined) { //currently we save all scheme due to automatic redistribution on server side.
          nodes.push({ nodeName: node.name, x: node.x, y: node.y });
        // }
      });
      
      if (nodes.length > 0) {
        const s = JSON.stringify(nodes);
        this.props.onSaveScheme(s);
      }
    }
  }

  handleResetSchemaClick() {
    this.props.onResetSchema();
  }

  handleDragEnd(nodeObj) {
    const locNode = this.props.nodes.find(node => node.name === nodeObj.name);
    if (locNode !== undefined) {
      // console.log(`[MyStage] Drag ends for ${locNode.name}`);

      locNode.x = nodeObj.x;
      locNode.y = nodeObj.y;
      // locNode.changed = true;
      this.setState({
        edited: true });
    }
  }

  handleDoubleClick(nodeObj) {
    //const locNode = this.props.nodes.find(node => node.name === nodeObj.name);
    const locNode = nodeObj;
    if (locNode !== undefined) {
      switch(locNode.nodeType) {
      case MyConsts.NODE_TYPE_PARAM: {

        const param = this.getParamByName(locNode.paramName);
        if (param) {

          let s = '';
          if (param.qd) {
            s = (param.qd.indexOf('B') > -1) ? 'blocked' : 'unblocked'
          }
         
          this.setState({ 
            openParamDialog: true,
            initialParamValue: param.value,
            initialBlockRawValues: s,            
            editedNodeName: locNode.name,
            editedParamName: locNode.paramName,
           });
          }
          break;
      }
      case MyConsts.NODE_TYPE_SECTIONCONNECTOR:
      case MyConsts.NODE_TYPE_SEC2SECCONNECTOR:
      {

        let s = 'blocked';
        const param = this.getParamByName(locNode.paramName);
        if (param) {
          if (param.qd) {
            s = (param.qd.indexOf('B') > -1) ? 'blocked' : 'unblocked'
          }
        }
         
        this.setState({ 
            openConnectionDialog: true,
            initialParamValue: locNode.switchedOn,
            initialBlockRawValues: s,            
            editedNodeName: locNode.name,
           });
        break;
      }
      default: {

      }
      }     
  
    }
  }  


  handleParamDialogClose (newValue) {
    this.setState({ openParamDialog: false });

    if (newValue !== 'dismiss') {
      const s = JSON.stringify( { paramName: this.state.editedParamName,
         cmd:  (newValue.newBlockRawValues === 'unblocked') ? 'unblock':'block',
         manualValue: newValue.newManualValue });
      this.props.onSaveParamManualValue(s);
    }
      
  };  


  handleConnectionDialogClose (newValue) {
    this.setState({ openConnectionDialog: false });

    if (newValue !== 'dismiss') {
      const s = JSON.stringify( { nodeName: this.state.editedNodeName,
         cmd:  (newValue.newBlockRawValues === 'unblocked') ? 'unblock':'block',
         manualValue: newValue.newManualValue });
      this.props.onSaveConnectionManualValue(s);
    }
      
  };  
  

  render() {

    const locNodes = this.props.nodes;
    const locLines = this.getLines();
    // const locW = window.innerWidth - 30;
    // const locH = window.innerHeight - 30;
    const locW = 3000;
    const locH = 5000;

    const locParams = this.props.params;

    for(let i=0; i<locNodes.length; i+=1) {
      const locNode = locNodes[i];
      if (locNode.nodeType === MyConsts.NODE_TYPE_PARAM) {
        for(let j=0; j<locParams.length; j+=1) {
          const locParam = locParams[j];
          if (locParam.name === locNode.paramName) {
            locNode.caption = locParam.value; 
            locNode.paramQD = locParam.qd;
            break;
          }
        }    
      }
    }
    

    return (
      <div>
        <Card className='container'>
          <div>
            <CardText>{this.props.psName}</CardText>
            <RaisedButton onClick={this.handleLoadSchemeClick}>Load</RaisedButton>
            <RaisedButton onClick={this.handleSaveSchemeClick}>Save</RaisedButton>
            <RaisedButton onClick={this.handleResetSchemaClick}>Reset</RaisedButton>
          </div>
        </Card>
        <Tabs>
          <Tab label='Schema' >
          <Stage width={locW} height={locH}>
          <Layer>
          {locLines.map(line => (
              <Line
                key={line.name}
                points={line.points}
                stroke="black"
                strokeWidth={1}
              />
            ))
            }
            {locNodes.map(rec => (
              <MySchemaNode
                key={rec.name}
                node={rec}
                onDragEnd={this.handleDragEnd}
                onDoubleClick={this.handleDoubleClick}
              />
            ))
          }

          </Layer>
        </Stage>
          </Tab>
          <Tab label='Params' >
          <MyParams
            params={this.props.params}
           />
        </Tab>
        </Tabs>


        <MyParamDialog
        open={this.state.openParamDialog}
        onClose={this.handleParamDialogClose}
        initialParamValue={this.state.initialParamValue}
        initialBlockRawValues={this.state.initialBlockRawValues}
        editedNodeName={this.state.editedNodeName}
        editedParamName={this.state.editedParamName}
        />

        <MyNodeConnectorDialog
        open={this.state.openConnectionDialog}
        onClose={this.handleConnectionDialogClose}
        initialParamValue={this.state.initialParamValue}
        initialBlockRawValues={this.state.initialBlockRawValues}
        editedNodeName={this.state.editedNodeName}
        />        
      </div>
    );
  }
}

 MyPSScheme.propTypes = {
  psName: PropTypes.string,
  nodes: PropTypes.array.isRequired,
  wires: PropTypes.array.isRequired,
  params: PropTypes.array.isRequired,
  onLoadScheme: PropTypes.func,
  onSaveScheme: PropTypes.func,
  onResetSchema: PropTypes.func,
  onSaveParamManualValue: PropTypes.func,
  onSaveConnectionManualValue: PropTypes.func,
};



