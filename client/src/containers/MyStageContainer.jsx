import React from 'react';
import MyStage from '../components/MyStage';
import MyFetchClient from './MyFetchClient'

const MATCHING_ITEM_LIMIT = 2500;


export default class MyStageContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fetchUrl: '',
      fetchData: '',
      fetchMethod: '',
      fetchCallback: null,
      nodes: [],
      wires: [],
      edited: false,
      };

    this.onLoadScheme = this.onLoadScheme.bind(this);
    this.onSaveScheme = this.onSaveScheme.bind(this);
  }

  onLoadScheme() {
    const prjName = 'test_proj';

    this.setState({
        fetchUrl: `api/nodes?proj=${prjName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (nodes) => {
          this.setState({
            nodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      });

      this.setState({
        fetchUrl: `api/wires?proj=${prjName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (wires) => {
          this.setState({
            wires: wires.slice(0, MATCHING_ITEM_LIMIT),
        });
        }
      });  
  }

  onSaveScheme(s) {
    const prjName = 'test_proj';

    this.setState({
        fetchUrl: `api/nodes?proj=${prjName}`,
        fetchMethod: 'post',
        fetchData: s,
        fetchCallback: (nodes) => {
          this.setState({
            nodes: nodes.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      });
  }  

  render() {
    return (
      <div>      
      <MyStage 
        nodes={this.state.nodes}
        wires={this.state.wires}
        onLoadScheme={this.onLoadScheme} 
        onSaveScheme={this.onSaveScheme} 
      />
      <MyFetchClient 
        fetchUrl={this.state.fetchUrl}
        fetchData={this.state.fetchData}
        fetchMethod={this.state.fetchMethod}
        fetchCallback={this.state.fetchCallback}/>
      </div>      
      );
  }
}

MyStageContainer.propTypes = {
 };
