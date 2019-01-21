import React from 'react';
import MainForm from '../components/MainForm';
import MyFetchClient from './MyFetchClient';
// import MyStompClient from '../modules/MyStompClient';
import makeUid from '../modules/MyFuncs';

const MATCHING_ITEM_LIMIT = 2500;


export default class MainPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      paramLists: [],
      params: [],
      regions: [],
      PSs: [],
      ps: '',
      };

    this.onLoadParams = this.onLoadParams.bind(this);
    this.onLoadPSs = this.onLoadPSs.bind(this);
    this.onLoadPS = this.onLoadPS.bind(this);

//    MyStompClient.connect(this.doOnWebsocketConnected);

  }

  componentDidMount() {

    const cmds = [
      {
        fetchUrl: 'api/paramLists',
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (paramLists) => {
          this.setState({
            paramLists: paramLists.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      },
      {
        fetchUrl: 'getRegions',
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (regions) => {
          this.setState({
            regions: regions.slice(0, MATCHING_ITEM_LIMIT),
        });
        }
      }
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }

  onLoadParams(paramListName) {
    const cmds = [
      {
        fetchUrl: `api/params?prmLstName=${paramListName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (params) => {
          this.setState({
            params: params.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      },
    ]

    this.setState({
        cmdUid: makeUid(5),
        fetchRequests: cmds,
      });
  }

  onLoadPSs(regionName) {
    const cmds = [
      {
        fetchUrl: `getRegionPSs?name=${regionName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (pss) => {
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
        fetchUrl: `getJsonPS?name=${psName}`,
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
    return (
      <div>      
      <MainForm
        paramLists={this.state.paramLists}
        params={this.state.params}
        regions={this.state.regions}
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

