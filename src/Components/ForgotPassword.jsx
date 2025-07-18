import React, { useState } from 'react';
import axios from 'axios';
import './CSS/ForgotPassword.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/send-otp', { email });
      setMsg('OTP sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Error sending OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/verify-otp', { email, otp });
      setMsg('OTP verified');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await axios.post('http://localhost:5000/update-password', { email, password });
      setMsg('✅ Password successfully updated');
      setStep(4); 
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-box">
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="fp-form">
            <h2>🔑 Forgot Password</h2>
            <label>Enter your registered email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="fp-btn">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fp-form">
            <h2>📩 Verify OTP</h2>
            <p>OTP sent to: <strong>{email}</strong></p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
            />
            <button type="submit" className="fp-btn">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fp-form">
            <h2>🔐 Reset Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
            <button type="submit" className="fp-btn">Update Password</button>
          </form>
        )}

        {step === 4 && (
          <div className="fp-form">
            <h2>✅ Success</h2>
            <p>Password has been updated. You can now login with your new password.</p>
          </div>
        )}

        {msg && <p style={{ color: 'green' }}>{msg}</p>}
        {error && <p className="fp-error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
