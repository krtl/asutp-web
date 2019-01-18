import React from 'react';
import MyStage from '../components/MyStage';
import MyFetchClient from './MyFetchClient'

const MATCHING_ITEM_LIMIT = 2500;

function makeUid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export default class MyStageContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      nodes: [],
      enodes: [],
      wires: [],
      edited: false,
      };

    this.onLoadScheme = this.onLoadScheme.bind(this);
    this.onSaveScheme = this.onSaveScheme.bind(this);
  }

  onLoadScheme() {
    const prjName = 'test_proj';
    const uid = makeUid(5);
    const cmds = [
      {
        fetchUrl: `api/nodes?proj=${prjName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (nodes) => {
          this.setState({
            nodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
            enodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      },
      {
        fetchUrl: `api/wires?proj=${prjName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (wires) => {
          this.setState({
            wires: wires.slice(0, MATCHING_ITEM_LIMIT),
        });
        }
      }
    ]

    this.setState({
        cmdUid: uid,
        fetchRequests: cmds,
      });
  }

  onSaveScheme(s) {
    // const prjName = 'test_proj';
    const uid = makeUid(5);
    const cmds = [
      {
//        fetchUrl: `api/save_node?proj=${prjName}`,
        fetchUrl: 'api/save_node',
        fetchMethod: 'post',
        fetchData: s,
        fetchCallback: (nodes) => {
          // this.setState({
          // });
        }
      },
    ]

    this.setState({
        cmdUid: uid,
        fetchRequests: cmds,
      });
  }

  render() {
    return (
      <div>      
      <MyStage 
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
