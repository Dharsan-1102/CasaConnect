import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './CSS/Login.css';
import loginImage from '../assets/login.png';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/login', credentials);
      const { token, role, name, profilePhoto, userId,apartment} = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('userPhoto', profilePhoto);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userApartment', apartment);

      const normalizedRole = role?.toLowerCase().trim();
      switch (normalizedRole) {
        case 'admin': navigate('/admin'); break;
        case 'resident': navigate('/resident'); break;
        case 'guard': navigate('/guard-dashboard'); break;
        case 'maintenance': navigate('/maintenance-dashboard'); break;
        default: navigate('/');
      }
      console.log("Login successful. Role received:", role);


    } catch (err) {
      setAttempts(prev => prev + 1);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <img src={loginImage} alt="Login" className="login-image" />
        </div>
        <div className="login-right">
          <form onSubmit={handleSubmit} className="login-form">
            <h1>CasaConnect Login</h1>
            <p className="subtitle">Access your community platform</p>

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>

            {error && <p className="login-error-msg">{error}</p>}
            {attempts > 0 && <p className="login-attempt-msg">Wrong attempts: {attempts}</p>}

            <button type="submit" className="login-btn">Login</button>

            <div className="login-links">
              <p><Link to="/forgot-password">Forgot Password?</Link></p>
              <p>Don't have an account? <Link to="/">Register here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
