import React, { useState,useEffect } from 'react';
import axios from 'axios';
import './CSS/Users.css';
import userImage from '../assets/signup.png';
import Navbar from './Navbar';

const Users = () => {
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [form, setForm] = useState({
    name: '',
    apartment: '',
    flat: '',
    email: '',
    password: '',
    phone_number: '',
    block: '',
    resident_role: '',
    profile_photo_url: '',
    status: 'Active',
    shift_time: '',
    specialization: '',
    role: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    if (form.apartment && role !== 'admin') {
      const fetchUsers = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/users/by-apartment/${form.apartment}`);
          setExistingUsers(res.data);
        } catch (err) {
          console.error('Failed to fetch existing users:', err);
        }
      };

      fetchUsers();
    } 
  }, [form.apartment]);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/apartment/all');
        setApartments(res.data);
      } catch (err) {
        console.error('Error fetching apartments:', err);
      }
    };

    fetchApartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setForm({ ...form, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanedForm = { ...form };
    if (role !== 'resident') {
      delete cleanedForm.flat;
      delete cleanedForm.block;
      delete cleanedForm.resident_role;
    }
    if (role !== 'guard') {
      delete cleanedForm.shift_time;
    }
    if (role !== 'maintenance') {
      delete cleanedForm.specialization;
    }

    try {
      const res = await axios.post('http://localhost:5000/admin-create-user', cleanedForm);
      setMessage('User created successfully!');
      setForm({
        name: '',
        apartment: '',
        flat: '',
        email: '',
        password: '',
        phone_number: '',
        block: '',
        resident_role: '',
        status: 'Active',
        shift_time: '',
        specialization: '',
        role: '',
      });
      setRole('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create user';
      setError(errorMsg);
    }
  };
  
  const checkPasswordStrength = (password) => {
    const strongRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    const mediumRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;

    if (strongRegex.test(password)) {
      setPasswordStrength('Strong');
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  };

  return (
    <>
      <Navbar />
      <div className="user-container">
        <div className="user-left">
          <h1>CasaConnect Admin</h1>
          <p className="subtitle">Add users to your community</p>
          <img src={userImage} alt="User creation" className="user-image" />
        </div>

        <div className="user-right">
          <h2>Create New User</h2>
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label>Select Role</label>
              <select name="role" value={role} onChange={handleRoleChange} required>
                <option value="">-- Select Role --</option>
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
                <option value="guard">Guard</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Enter the Name" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="@example.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={(e) => {
                    handleChange(e);
                    checkPasswordStrength(e.target.value);
                  }}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="show-toggle"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordStrength && (
                <small className={`strength-${passwordStrength.toLowerCase()}`}>
                  Strength: {passwordStrength}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Apartment</label>
              <select name="apartment" value={form.apartment} onChange={handleChange} required>
                <option value="">Select Apartment</option>
                {apartments.map((apt) => (
                  <option key={apt._id} value={apt.name}>{apt.name}</option>
                ))}
              </select>
            </div>

            {role === 'resident' && (
              <>
                <div className="form-group">
                  <label>Flat</label>
                  <input type="text" name="flat" value={form.flat} onChange={handleChange} required placeholder="B-204" />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone_number" pattern="[0-9]{10}" value={form.phone_number} onChange={handleChange} required placeholder="Enter 10-digit Number" />
                </div>

                <div className="form-group">
                  <label>Block</label>
                  <input type="text" name="block" value={form.block} onChange={handleChange} required placeholder="Block A" />
                </div>

                <div className="form-group">
                  <label>Resident Role</label>
                  <select name="resident_role" value={form.resident_role} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}

            {role === 'guard' && (
              <>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone_number" pattern="[0-9]{10}" value={form.phone_number} onChange={handleChange} required placeholder="Enter 10-digit Number" />
                </div>

                <div className="form-group">
                  <label>Shift Time</label>
                  <select name="shift_time" value={form.shift_time} onChange={handleChange} required>
                    <option value="">Select Shift</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </>
            )}

            {role === 'maintenance' && (
            <>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  pattern="[0-9]{10}"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter 10-digit Number"
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

            <button type="submit" className="signup-btn">Create User</button>
            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default Users;
