import React from 'react';
import MyParamHistoryForm from '../components/MyParamHistoryForm';
import MyFetchClient from './MyFetchClient'

const MATCHING_VALUES_LIMIT = 2500;


export default class ParamHistoryPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fetchUrl: '',
      fetchData: '',
      fetchMethod: '',
      fetchCallback: null,
      paramName: '',
      paramValues: [],      
    };

    this.reloadParamValues = this.reloadParamValues.bind(this);
  }

  reloadParamValues(paramName, useHalfHourValues) {
    const historyParamName = window.location.href.slice(window.location.href.lastIndexOf('/') + 1);

    let url = '';
    if (useHalfHourValues){
      url=`api/paramHalfHourValues?paramName=${historyParamName}`;
    }
    else {
      url=`api/paramValues?paramName=${historyParamName}`;
    }
  
    this.setState({
      paramName: historyParamName,
      fetchUrl: url,
      fetchMethod: 'get',
      fetchData: '',
      fetchCallback: (values) => {
        this.setState({
          paramValues: values.slice(0, MATCHING_VALUES_LIMIT),
        });
      }
    });
  }


  render() {
    return (
      <div>      
      <MyParamHistoryForm 
      paramName={this.state.paramName}
      paramValues={this.state.paramValues}
      onReloadParamValues={this.reloadParamValues} 
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

ParamHistoryPage.propTypes = {
 };
