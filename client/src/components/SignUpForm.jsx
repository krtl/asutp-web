import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

 export default function SignUpForm (props) {

    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
  
    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };
  
    const handleMouseUpPassword = (event) => {
      event.preventDefault();
    };
  
    const handleLoginButtonClicked = (event) => {
      props.onSubmit();
    };

  return (
  <Box className="container"
          sx={{
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              minHeight:"85vh"
              }}>
    <form action="/" onSubmit={props.onSubmit}>
      <h2 className="card-heading">New account</h2>

      {props.errors.summary && <p className="error-message">{props.errors.summary}</p>}

      <div className="field-line">
        <TextField sx={{ m: 1, width: '30ch' }}
          label="Name"
          name="name"
          autoComplete="username"
          error={!!props.errors.name}
          helperText={props.errors.name}
          onChange={props.onChange}
          value={props.user.name}
        />
      </div>

      <div className="field-line">
        <TextField sx={{ m: 1, width: '30ch' }}
          label="Email"
          name="email"
          autoComplete="useremail"
          error={!!props.errors.email}
          helperText={props.errors.email}
          onChange={props.onChange}
          value={props.user.email}
        />
      </div>

      <div className="field-line">
          <FormControl sx={{ m: 1, width: '30ch' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            name='password'
            error={!!props.errors.password}
            onChange={props.onChange}
            value={props.user.password}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
          <FormHelperText
            error={!!props.errors.password}>
              {props.errors.password}</FormHelperText>
        </FormControl>        
      </div>

      
      <div className='button-line'>
        <Button variant="outlined"  onClick={handleLoginButtonClicked}>Create</Button>
      </div>

      <CardContent>Already have an account? <Link to={'/login'}>Log in</Link></CardContent>
    </form>
  </Box>
);
}

SignUpForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};



