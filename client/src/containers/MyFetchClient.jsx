import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  loadingBegin,
  loadingEnd
} from '../reducers/actions'


class MyFetchClient extends React.Component {
    
    constructor() {
        super()
    
        this.intervalId = null
        this.startClock = this.startClock.bind(this)
        this.stopClock = this.stopClock.bind(this)
        this.getCurrentTime = this.getCurrentTime.bind(this)
        this.isStarted = false;
      }

    componentDidMount() {
        this.startClock()
      }
    
      componentWillUnmount() {
        this.stopClock()
      }
    
      startClock() {
        this.intervalId = setInterval(this.getCurrentTime, 3000)
      }
    
      stopClock() {
        clearInterval(this.intervalId)
      }    

      getCurrentTime() {
        if (this.isStarted){
            this.props.onLoadingStart();
        }
        else
        {
            this.props.onLoadingEnd();
        }
        this.isStarted = !this.isStarted;
      }

    render() {
        return null
      }    
 }
 

 MyFetchClient.propTypes = {
    onLoadingStart: PropTypes.func.isRequired,
    onLoadingEnd: PropTypes.func.isRequired,   
   };

export default connect(null,
    dispatch => ({
      onLoadingStart: (payload) => {
        dispatch(loadingBegin(payload));      
      },
      onLoadingEnd: (payload) => {
        dispatch(loadingEnd(payload));
      },
    }),
  )(MyFetchClient);