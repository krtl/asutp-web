import React from 'react';
import MyPSSchemeForm from '../components/MyPSSchemeForm';
import MyFetchClient from './MyFetchClient';
import makeUid from '../modules/MyFuncs';
import MyStompClient from '../modules/MyStompClient';
// import {MyConsts} from '../modules/MyConsts';


const MATCHING_ITEM_LIMIT = 2500;

let updateCount = 0;
let valuesUpdated = 0;
let timerId;

export default class PSSchemePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      psName: '',
      nodes: [],
      wires: [],
      params: [],
      update: false,      
    };

    this.onLoadScheme = this.onLoadScheme.bind(this);    
    this.onSaveScheme = this.onSaveScheme.bind(this);
    this.onSaveManualValue = this.onSaveManualValue.bind(this);

  }

  componentDidMount() {

    timerId = setInterval(() => {
        if(valuesUpdated > 0) {
          valuesUpdated = 0;
          this.setState({
                update: true,
              });
        }
      }, 1000);    
  }

  componentWillUnmount() {
    MyStompClient.unsubscribeFromValues();
    clearInterval(timerId);

    this.setState({
      nodes: [],
      wires: [],
    });
  }

  onLoadScheme(psName) {

    if (psName === '') {
      psName = window.location.href.slice(window.location.href.lastIndexOf('/') + 1);
    }    

    this.setState({
      psName: psName,
      nodes: [],
      wires: [],
    });

    const cmds = [
      {
        fetchUrl: `getPSParams?name=${psName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (params) => {
          this.setState({
            params: params.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      },

      {
        fetchUrl: `getPSSchema?name=${psName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (schema) => {
          this.setState({
            nodes: schema.nodes,
            wires: schema.wires,
          });

          MyStompClient.subscribeToValues(psName, (value) => {
            let b = false;
            if('nodeName' in value) {
              for (let i = 0; i < this.state.nodes.length; i += 1) {
                const locNode = this.state.nodes[i];
                if (locNode.name === value.nodeName) {
                  locNode.powered = value.newState;
                  locNode.qd = value.qd;
                  b = true;
                  break;
                }
              }
            }
            if('paramName' in value) {
              for (let i = 0; i < this.state.params.length; i += 1) {
                const locParam = this.state.params[i];
                if (locParam.name === value.paramName) {
                  locParam.value = value.value;
                  locParam.dt = value.dt;
                  locParam.qd = value.qd;
                  b = true;
                  break;
                }
              }
            }
            if (b) {
              valuesUpdated = 1;
            }
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
        fetchUrl: `api/saveNodeCoordinates?schemaName=${this.state.psName}`,
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

  onSaveManualValue(s) {
    const cmds = [
      {
        fetchUrl: 'api/saveParamManualValue',
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
    updateCount += 1;
    const c = updateCount;
    return (      
      <div>{c}     
      <MyPSSchemeForm 
        psName={this.state.psName}
        nodes={this.state.nodes}
        wires={this.state.wires}
        params={this.state.params}
        onLoadScheme={this.onLoadScheme} 
        onSaveScheme={this.onSaveScheme}
        onSaveManualValue={this.onSaveManualValue}         
      />
      <MyFetchClient 
        cmdUid={this.state.cmdUid}
        fetchRequests={this.state.fetchRequests}
      />
      </div>      
      );
  }

}

PSSchemePage.propTypes = {
 };
