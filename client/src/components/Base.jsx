import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import Auth from '../modules/Auth';
import MainStatus from './MainStatus';

const Base = ({ children}) => (
  <div>      
    <div className='top-bar'>
      <div className='top-bar-left'>
        <NavLink to='/'>ASUTP</NavLink>
        <MainStatus />
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
  children: PropTypes.object.isRequired,
};

export default Base;
