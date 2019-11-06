import React from 'react';
import MainForm from '../components/MainForm';
import MyFetchClient from './MyFetchClient';
// import MyStompClient from '../modules/MyStompClient';
import makeUid from '../modules/MyFuncs';

const MATCHING_ITEM_LIMIT = 2500;

let updateCount = 0;
let valuesUpdated = 0;
let timerId;

export default class MainPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      schemas: [],
      params: [],
      PSs: [],
      ps: '',
      update: false,
      };

    this.onLoadParams = this.onLoadParams.bind(this);
    this.onLoadPSs = this.onLoadPSs.bind(this);
    this.onLoadPS = this.onLoadPS.bind(this);

  }

  componentDidMount() {

    const cmds = [
      {
        fetchUrl: '/getSchemas',
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (schemas) => {
          let locSchemas = schemas.slice(0, MATCHING_ITEM_LIMIT);
          locSchemas.sort((r1, r2) => {
              if (r1.caption > r2.caption) {
                return 1;
              }
              if (r1.caption < r2.caption) {
                return -1;
              }
              return 0;
            }
          );
          this.setState({
            schemas: locSchemas,
        });
        }
      }
    ]
    
    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });


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
    // MyStompClient.unsubscribeFromValues();
    clearInterval(timerId);
  }

  onLoadParams(schemaName) {
    const cmds = [
      {
        fetchUrl: `/api/params?schemaName=${schemaName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (params) => {
          this.setState({
            params: params.slice(0, MATCHING_ITEM_LIMIT),
          });

          // MyStompClient.subscribeToValues(schemaName, (value) => {
          //   if('paramName' in value) {
          //     let b = false;
          //     for (let i = 0; i < this.state.params.length; i += 1) {
          //       const locParam = this.state.params[i];
          //       if (locParam.name === value.paramName) {
          //         locParam.value = value.value;
          //         locParam.dt = value.dt;
          //         locParam.qd = value.qd;
          //         b = true;
          //         break;
          //       }
          //     }
          //     if (b) {
          //       valuesUpdated = 1;
          //     }
          //   }
          // });          
        }
      },
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }

  onLoadPSs(schemaName) {
    const cmds = [
      {
        fetchUrl: `/getSchemaPSs?name=${schemaName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (pss) => {

          pss.sort((ps1, ps2) => {
            if (ps1.name > ps2.name) {
              return 1;
            }
            if (ps1.name < ps2.name) {
              return -1;
            }
            return 0;
          }
        );

          this.setState({
            PSs: pss.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      },
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }  

  onLoadPS(psName) {
    const cmds = [
      {
        fetchUrl: `/getJsonPS?name=${psName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (ps) => {
          this.setState({
            ps: ps, //
          });
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
      <MainForm
        schemas={this.state.schemas}
        params={this.state.params}
        PSs={this.state.PSs}
        ps={this.state.ps}  
        onLoadParams={this.onLoadParams} 
        onLoadPSs={this.onLoadPSs} 
        onLoadPS={this.onLoadPS} 
      />
      <MyFetchClient 
        cmdUid={this.state.cmdUid}
        fetchRequests={this.state.fetchRequests}
      />
      </div>      
      );
  }
}

MainPage.propTypes = {
 };

