import React from 'react';
import MyRegionSchema from '../components/MyRegionSchema';
import MyFetchClient from './MyFetchClient';
import makeUid from '../modules/MyFuncs';
// import {MyConsts} from '../modules/MyConsts';

// const MATCHING_ITEM_LIMIT = 10000;


export default class MyStageContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      regionName: '',
      // doNotRender: false,
      nodes: [],
      wires: [],
      };

    this.onLoadScheme = this.onLoadScheme.bind(this);    
    this.onSaveScheme = this.onSaveScheme.bind(this);
    this.onSaveManualStates = this.onSaveManualStates.bind(this);
  }

  componentWillUnmount() {
    this.setState({
      nodes: [],
      wires: [],
    });
  }  

  onLoadScheme(schemaName) {
    this.setState({
      regionName: schemaName,
      nodes: [],
      wires: [],
    });

    const cmds = [
      {
        fetchUrl: `getSchema?name=${schemaName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (schema) => {
          this.setState({
            nodes: schema.nodes,
            wires: schema.wires,
          });
        }
      },
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }

  onSaveScheme(s) {
    const cmds = [
      {
        fetchUrl: `api/saveNetNodeSchema?schemaName=${this.state.regionName}`,
        fetchMethod: 'post',
        fetchData: s,
        fetchCallback: () => {
          // this.setState({
          // });
        }
      },
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }

  onSaveManualStates(s) {
    const cmds = [
      {
        fetchUrl: 'api/saveManualNodeStates',
        fetchMethod: 'post',
        fetchData: s,
        fetchCallback: () => {
          // this.setState({
          // });
        }
      },
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !(nextState.doNotRender);
  // }  

  render() {
    return (
      <div>      
      <MyRegionSchema 
        schemas={this.props.schemas}
        nodes={this.state.nodes}
        wires={this.state.wires}
        onLoadScheme={this.onLoadScheme} 
        onSaveScheme={this.onSaveScheme}
        onSaveManualStates={this.onSaveManualStates} 
      />
      <MyFetchClient 
        cmdUid={this.state.cmdUid}
        fetchRequests={this.state.fetchRequests}
      />
      </div>      
      );
  }
}

MyStageContainer.propTypes = {
 };
