import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; 
import api from './Axios'; 
import { UserContext } from '../context/UserContext';

function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate(); // Use navigate for redirection after login
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      // Call the login API
      const response = await api.post('/login', { username, password }, { withCredentials: true });
      console.log(response.data.Success);
      
  
      if (response.data.Success === "Success") {
        navigate('/');
        window.location.reload();
      } else {
        setErrorMessage('Unexpected error during login.');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Login failed.');
      } else {
        setErrorMessage('Unable to connect to the server.');
      }
    }
  };
  

  return (
    <div id="single-wrapper">
      <form onSubmit={handleLogin} className="frm-single">
        <div className="inside">
          <div className="title">Admin</div>
          <div className="frm-title">Login</div>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <div className="frm-input">
            <input
              type="text"
              placeholder="Username"
              className="frm-inp"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <i className="fa fa-user frm-ico" />
          </div>
          <div className="frm-input">
            <input
              type="password"
              placeholder="Password"
              className="frm-inp"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i className="fa fa-lock frm-ico" />
          </div>
          <div className="clearfix margin-bottom-20">
            <div className="text-center">
              <Link to="/forget-password" className="a-link">
                <i className="fa fa-unlock-alt" /> Forgot password?
              </Link>
            </div>
          </div>
          <button  className="frm-submit">
            Login <i className="fa fa-arrow-circle-right" />
          </button>
          <div className="frm-footer text-center">Rahul © 2016.</div>
        </div>
      </form>
    </div>
  );
}

export default Signin;
