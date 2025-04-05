// PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ children }) => {
  const token = Cookies.get('AdminToken'); // Replace 'token' with your actual cookie name
  
  return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;