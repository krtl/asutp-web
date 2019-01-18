import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import MyParams from './MyParams';
import MyShutdowns from './MyShutdowns';
import MyStageContainer from '../containers/MyStageContainer';
// import Client from '../modules/Client'; // eslint-disable-line

class MainForm extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    console.log('MainForm did mount');
   }
   

  render() {
    return (
      <Tabs>
        <Tab label='Params' >
          <MyParams />
        </Tab>
        <Tab label='PSs' >
          {/* <MyPSs /> */}
        </Tab>
        <Tab label='Shutdowns' >
          <MyShutdowns
            shutdowns={[]}
          />
        </Tab>
        <Tab label='Scheme' >
          <div className='container'>


            <MyStageContainer />
          </div>
        </Tab>
      </Tabs>
    );
  }
}

MainForm.propTypes = {
  paramsLists: PropTypes.array.isRequired,
  params: PropTypes.array.isRequired,
  regions: PropTypes.array.isRequired,
  PSs: PropTypes.array.isRequired,
  ps: PropTypes.string.isRequired,
  onGetParams: PropTypes.func.isRequired,
  onGetPSs: PropTypes.func.isRequired,
  onGetPS: PropTypes.func.isRequired,
};

export default MainForm;
