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
  }

  onLoadScheme(regionName) {
    this.setState({
      regionName,
      nodes: [],
      wires: [],
      // doNotRender: false,
    });

    const cmds = [
      {
        // fetchUrl: `api/getRegionSheme?name=${regionName}`,
        fetchUrl: `getRegionScheme?name=${regionName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (schema) => {
          this.setState({
            nodes: schema.nodes,
            wires: schema.wires,
            // doNotRender: true,
          });
        }
      },
      // {
      //   fetchUrl: `api/netNodeSchema?schemaName=${regionName}`,
      //   fetchMethod: 'get',
      //   fetchData: '',
      //   fetchCallback: (schemaNodes) => {

      //     const locSchemaNodes = schemaNodes.slice(0, MATCHING_ITEM_LIMIT);

      //     if (locSchemaNodes.length === 0)
      //     { 
      //       // use default coordinates!
      //       let x = 0;
      //       let y = 0;
      //       for(let i=0; i<this.state.nodes.length; i++) {
      //         const node = this.state.nodes[i];
      //         switch (node.nodeType) {
      //           case MyConsts.NODE_TYPE_LEP: {
      //             x += MyConsts.NODE_LEP_WIDTH + 30;
      //             if (x > 2900) {
      //               x = 0;
      //               y += MyConsts.NODE_LEP_HEIGHT + MyConsts.NODE_LEP_Y_OFFSET + 20;
      //             }
      //             break;
      //           }
                
      //           case MyConsts.NODE_TYPE_PS:  {
      //             x += MyConsts.NODE_PS_RADIUS + 30;
      //             if (x > 2900) {
      //               x = 0;
      //               y += MyConsts.NODE_PS_RADIUS + 20;
      //             }
      //             break;
      //           }
      //           default: {
      //             x += 50;
      //             if (x > 2900) {
      //               x = 0;
      //               y += 50;
      //             }
      //           }
      //         }
              
      //         node.x = x;
      //         node.y = y;               
              
      //       }
      //     } else {
      //       for(let i=0; i<this.state.nodes.length; i++) {
      //         const node = this.state.nodes[i];
      //         for(let j=0; j<locSchemaNodes.length; j++) {
      //           const schemaNode = locSchemaNodes[j];
      //           if (node.name === schemaNode.nodeName) {
      //             node.x = schemaNode.x;
      //             node.y = schemaNode.y;
      //             break;
      //           }
      //         }
      //       }
      //     }

      //     this.setState({
      //       doNotRender: false,
      //     });
      //   }
      // }
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

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !(nextState.doNotRender);
  // }  

  render() {
    return (
      <div>      
      <MyRegionSchema 
        regions={this.props.regions}
        nodes={this.state.nodes}
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
