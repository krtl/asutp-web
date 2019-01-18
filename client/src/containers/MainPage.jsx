import React from 'react';
import MainForm from '../components/MainForm';
import MyFetchClient from './MyFetchClient';
import MyStompClient from '../modules/MyStompClient';
import makeUid from '../modules/MyFuncs';

const MATCHING_ITEM_LIMIT = 2500;


export default class MainPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      paramsLists: [],
      params: [],
      regions: [],
      PSs: [],
      ps: '',
      };

    this.onGetParams = this.onGetParams.bind(this);
    this.onGetPSs = this.onGetPSs.bind(this);
    this.onGetPSs = this.onGetPSs.bind(this);

    MyStompClient.connect(this.doOnWebsocketConnected);

  }

  componentDidMount() {

    const cmds = [
      {
        fetchUrl: 'api/paramLists',
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (paramsLists) => {
          this.setState({
            paramsLists: paramsLists.slice(0, MATCHING_ITEM_LIMIT),
          });
        }
      },
      {
        fetchUrl: 'project/getRegions',
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

  onGetParams(paramListName) {
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

  onGetPSs(regionName) {
    const cmds = [
      {
        fetchUrl: `projects/getRegionPSs?name=${regionName}`,
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

  onGetPS(psName) {
    const cmds = [
      {
        fetchUrl: `projects/getJsonPS?name=${psName}`,
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
        paramsLists={this.state.paramLists}
        params={this.state.params}
        regions={this.state.regions}
        PSs={this.state.PSs}
        ps={this.state.ps}  
        onGetParams={this.onGetParams} 
        onGetPSs={this.onGetPSs} 
        onGetPS={this.onGetPS} 
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

