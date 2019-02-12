import React from 'react';
import MyRegionSchema from '../components/MyRegionSchema';
import MyFetchClient from './MyFetchClient';
import makeUid from '../modules/MyFuncs';

const MATCHING_ITEM_LIMIT = 10000;


export default class MyStageContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      regionName: '',
      nodes: [],
      enodes: [],
      wires: [],
      };

    this.onLoadScheme = this.onLoadScheme.bind(this);
    this.onSaveScheme = this.onSaveScheme.bind(this);
  }

  onLoadScheme(regionName) {
    this.setState({regionName}) ;

    const cmds = [
      {
        // fetchUrl: `api/getRegionSheme?name=${regionName}`,
        fetchUrl: `getRegionScheme?name=${regionName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (schema) => {
          this.setState({
            nodes: schema.nodes,
            enodes: schema.nodes,
            wires: schema.wires,
          });
        }
      },
      {
        fetchUrl: `api/netNodeSchema?schemaName=${regionName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (schemaNodes) => {

          const locSchemaNodes = schemaNodes.slice(0, MATCHING_ITEM_LIMIT);
          for(let i=0; i<this.state.nodes.length; i++) {
            const node = this.state.nodes[i];
            for(let j=0; i<locSchemaNodes.length; j++) {
              const schemaNode = locSchemaNodes[j];
              if (node.name === schemaNode.nodeName) {
                node.x = schemaNode.x;
                node.y = schemaNode.y;
                break;
              }
            }
          }
          this.setState({
            nodes: this.state.nodes,// update coordinates ?
          });
        }
      }
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

  render() {
    return (
      <div>      
      <MyRegionSchema 
        regions={this.props.regions}
        nodes={this.state.nodes}
        enodes={this.state.enodes}
        wires={this.state.wires}
        onLoadScheme={this.onLoadScheme} 
        onSaveScheme={this.onSaveScheme} 
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
