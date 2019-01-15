import React from 'react';
import PropTypes from 'prop-types';
import { Link, IndexLink } from 'react-router';
import Auth from '../modules/Auth';
// import Client from '../modules/Client';
import CircularProgress from '@material-ui/core/CircularProgress';


const Base = ({ loading, children }) => (
  <div>
    <div className='top-bar'>
      <div className='top-bar-left'>
        <IndexLink to='/'>ASUTP</IndexLink>
        {loading && <CircularProgress size={22} />}
      </div>

      {Auth.isUserAuthenticated() ? (
        <div className='top-bar-right'>
          <Link to='/logout'>{Auth.getData()}</Link>
          <Link to='/logout'>Log out</Link>
        </div>
      ) : (
        <div className='top-bar-right'>
          <Link to='/login'>Log in</Link>
          <Link to='/signup'>Sign up</Link>
        </div>
      )}

    </div>

    { /* child component will be rendered here */ }
    {children}

  </div>
);

Base.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.object.isRequired,
};

export default Base;
