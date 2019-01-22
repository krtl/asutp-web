import React from 'react';
import MyPSAsutpLinkageForm from '../components/MyPSAsutpLinkageForm';
import MyFetchClient from './MyFetchClient';
import makeUid from '../modules/MyFuncs';

export default class PSAsutpLinkagePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cmdUid: '',
      fetchRequests: [],
      psName: '',
      PS: {psparts:[]},
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
        fetchUrl: `getJsonPS?name=${psName}`,
        fetchMethod: 'get',
        fetchData: '',
        fetchCallback: (value) => {
          this.setState({
            PS: value,
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
      <MyPSAsutpLinkageForm 
        psName={this.state.psName}
        PS={this.state.PS}
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

PSAsutpLinkagePage.propTypes = {
 };
