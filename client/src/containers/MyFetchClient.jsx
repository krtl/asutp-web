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
     
      doPost(request) {

        this.props.onLoadingStart();

        fetch(new Request(request.fetchUrl, myPostInit),
          {
            body: request.fetchData,
          })
          .then(this.checkStatus)
          .then(this.parseJSON)
          .then(request.fetchCallback)
          .catch(this.setError);
      }

      doGet(request) {

        this.props.onLoadingStart();

        if (!myHeaders) { this.recreateHeader(); }
        return fetch(new Request(request.fetchUrl, myGetInit), {
          accept: 'application/json',
        })
          .then(this.checkStatus)
          .then(this.parseJSON)
          .then(request.fetchCallback)
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
        if (this.props.cmdUid !== prevProps.cmdUid) {
            this.props.fetchRequests.forEach(request => {
                if (request.fetchUrl) {
                  if (request.fetchCallback) {
                    if (request.fetchMethod === 'post') {
                      this.doPost(request);
                    }
                    else {
                      this.doGet(request);
                    }
                  }
                }
            });
          }
      }

    render() {
        return null
      }    
 }
 

 MyFetchClient.propTypes = {
  cmdUid: PropTypes.string.isRequired,
  fetchRequests: PropTypes.arrayOf(PropTypes.shape({
      fetchUrl: PropTypes.string,
      fetchMethod: PropTypes.string,
      fetchData: PropTypes.string,
      fetchCallback: PropTypes.func,
    })).isRequired,
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