import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Auth from '../modules/Auth';
import {
  fetchingBegin,
  fetchingEnd
} from '../reducers/actions'


let myHeaders = null;   // this is temporary
let myGetInit = null;   // this is temporary
let myPostInit = null;  // this is temporary

class MyFetchClient extends React.Component {
    
    constructor(props) {
        super(props)
    
        this.doFetch = this.doGet.bind(this);
        this.checkStatus = this.checkStatus.bind(this);
        this.parseJSON = this.parseJSON.bind(this);
        this.setError = this.setError.bind(this);
      }

      
      recreateHeader() {
        myHeaders = new Headers({
      //  "Content-Length": content.length.toString(),
      //  'Content-type': 'application/x-www-form-urlencoded',
          'Content-type': 'application/json;charset=UTF-8',
          'Authorization': `bearer ${Auth.getToken()}`,
        });
      
        myGetInit = { method: 'GET',
          headers: myHeaders,
        };
      
        myPostInit = { method: 'POST',
          headers: myHeaders,
        };
      }
     
      doPost(data, cb) {

        this.props.onLoadingStart();

        fetch(new Request(this.props.fetchUrl, myPostInit),
          {
            body: data,
          })
          .then(this.checkStatus)
          .then(this.parseJSON)
          .then(cb)
          .catch(this.setError);
      }

      doGet(cb) {

        this.props.onLoadingStart();

        if (!myHeaders) { this.recreateHeader(); }
        return fetch(new Request(this.props.fetchUrl, myGetInit), {
          accept: 'application/json',
        })
          .then(this.checkStatus)
          .then(this.parseJSON)
          .then(cb)
          .catch(this.setError);
      }
      
      setError(error) {
        console.log(error); // eslint-disable-line no-console  
      }
      
      checkStatus(response) {
        this.props.onLoadingEnd();
        if (response.status >= 200 && response.status < 300) {
          return response;
        }
        const error = new Error(`HTTP Error ${response.statusText}`);
        error.status = response.statusText;
        error.response = response;
        console.log(error); // eslint-disable-line no-console
        throw error;
      }
      
       parseJSON(response) {
        return response.json();
      }      

    componentDidUpdate(prevProps){
        if (this.props.fetchUrl !== prevProps.fetchUrl) {
          if (this.props.fetchUrl) {
            if (this.props.fetchCallback) {
              if (this.props.fetchMethod === 'post') {
                this.doPost(this.props.fetchData, this.props.fetchCallback);
              }
              else {
                this.doGet(this.props.fetchCallback);
              }
            }
          }
        }
      }

    render() {
        return null
      }    
 }
 

 MyFetchClient.propTypes = {
    fetchUrl: PropTypes.string,
    fetchMethod: PropTypes.string,
    fetchData: PropTypes.string,
    fetchCallback: PropTypes.func,
    onLoadingStart: PropTypes.func.isRequired,
    onLoadingEnd: PropTypes.func.isRequired,   
   };

export default connect(null,
    dispatch => ({
      onLoadingStart: (payload) => {
        dispatch(fetchingBegin(payload));      
      },
      onLoadingEnd: (payload) => {
        dispatch(fetchingEnd(payload));
      },
    }),
  )(MyFetchClient);