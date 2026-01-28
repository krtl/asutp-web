import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import MyServerStatus from "../components/MyServerStatus/MyServerStatus";

import MyStompClient from "../modules/MyStompClient";
import Auth from "../modules/Auth";

import { useDispatch } from 'react-redux'
import { setSocketStatus, setCollisionsCount } from "../reducers/mainStatusSlice";



export default function MyServerStatusContainer(props) {

  const [serverStatus, setServerStatus] = useState({});

  // const socketStatus = useSelector(state => state.mainStatus.socketStatus)
  const dispatch = useDispatch()

    useEffect(() => {

        // componentWillMount

        MyStompClient.setConnectedCallback(text => {
          if (text !== "connected") {
            dispatch(setSocketStatus(text));
            setServerStatus({});
          } else {
            dispatch(setSocketStatus("connected"));
            if (Auth.canSeeServerStatus()){
              MyStompClient.subscribeToServerStatus(value => {
                // console.log(value);
                setServerStatus(value);
                dispatch(setCollisionsCount(value.collisionsCount));
              });  
            }
          }
        });
      

        return () => {
            // componentWillUnmount
            MyStompClient.unsubscribeFromServerStatus();
          };
// eslint-disable-next-line
    }, []);




    return (
      <div>
            <MyServerStatus
              serverStatus={serverStatus}
            />
      </div>
    );
}

MyServerStatusContainer.propTypes = {
  history: PropTypes.object.isRequired
};
