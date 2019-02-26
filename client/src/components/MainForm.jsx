import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import MyParams from './MyParams';
import MyPSs from './MyPSs';
import MyNodeStateHistory from '../containers/MyNodeStateHistory';
import MyRegionSchemaContainer from '../containers/MyRegionSchemaContainer';

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
            schemas={this.props.schemas}
            params={this.props.params}
            onLoadParams={this.props.onLoadParams}
           />
        </Tab>
        <Tab label='PSs' >
          <MyPSs
          schemas={this.props.schemas}
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


            <MyRegionSchemaContainer
              schemas={this.props.schemas}
            />
          </div>
        </Tab>
      </Tabs>
    );
  }
}

MainForm.propTypes = {
  params: PropTypes.array.isRequired,
  schemas: PropTypes.array.isRequired,
  PSs: PropTypes.array.isRequired,
  ps: PropTypes.string.isRequired,
  onLoadParams: PropTypes.func.isRequired,
  onLoadPSs: PropTypes.func.isRequired,
  onLoadPS: PropTypes.func.isRequired,
};

export default MainForm;
