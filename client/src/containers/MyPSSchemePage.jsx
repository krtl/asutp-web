import React from 'react';
import MyPSSchemeForm from '../components/MyPSSchemeForm';
import MyFetchClient from './MyFetchClient';
import makeUid from '../modules/MyFuncs';

export default class PSSchemePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      psName: '',
      psJson: '',
    };

    this.reloadPS = this.reloadPS.bind(this);
  }

  reloadPS(psName) {
    if (psName === '') {
        psName = window.location.href.slice(window.location.href.lastIndexOf('/') + 1);
    }

    const uid = makeUid(5);
    const cmds = [
      {
        fetchUrl: `api/psJson?psName=${psName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (value) => {
          this.setState({
            psJsons: value,
          });
        },
      }
    ]

    this.setState({
        cmdUid: uid,
        fetchRequests: cmds,
        psName: psName,
      });
  }


  render() {
    return (
      <div>      
      <MyPSSchemeForm 
        psName={this.state.psName}
        psJson={this.state.psJson}
        onReloadPS={this.reloadPS} 
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
