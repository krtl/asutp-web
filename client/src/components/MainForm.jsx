import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import MyParams from './MyParams';
import MyPSs from './MyPSs';
import MyNodeStateHistory from '../containers/MyNodeStateHistory';
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
          <MyParams
            paramLists={this.props.paramLists}
            params={this.props.params}
            onLoadParams={this.props.onLoadParams}
           />
        </Tab>
        <Tab label='PSs' >
          <MyPSs
          regions={this.props.regions}
          PSs={this.props.PSs}
          onLoadPSs={this.props.onLoadPSs}
          />
        </Tab>
        <Tab label='Shutdowns' >
          <MyNodeStateHistory
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
  paramLists: PropTypes.array.isRequired,
  params: PropTypes.array.isRequired,
  regions: PropTypes.array.isRequired,
  PSs: PropTypes.array.isRequired,
  ps: PropTypes.string.isRequired,
  onLoadParams: PropTypes.func.isRequired,
  onLoadPSs: PropTypes.func.isRequired,
  onLoadPS: PropTypes.func.isRequired,
};

export default MainForm;
