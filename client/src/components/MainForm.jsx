import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import MyParams from './MyParams';
import MyShutdowns from './MyShutdowns';
import MyStage from './MyStage';
import Client from '../modules/Client'; // eslint-disable-line


class Dashboard extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <Tabs>
        <Tab label='Params' >
          <MyParams
            params={[]}
          />
        </Tab>
        <Tab label='Shutdowns' >
          <MyShutdowns
            shutdowns={[]}
          />
        </Tab>
        <Tab label='Scheme' >
          <div className='container'>


            {/*{this.props.secretData && <CardText style={{ fontSize: '16px', color: 'green' }}>{this.props.secretData}</CardText>}*/}

            <MyStage />
          </div>
        </Tab>
      </Tabs>
    );
  }
}

Dashboard.propTypes = {
  secretData: PropTypes.string.isRequired,
};

export default Dashboard;
