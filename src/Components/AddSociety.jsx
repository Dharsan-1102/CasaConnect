import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './CSS/AddSociety.css';
import SocietyImg from '../assets/society.png';

const AddSociety = () => {
  const [form, setForm] = useState({ name: '', address: '', city: '', pincode: '' });
  const [societies, setSocieties] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchSocieties = async () => {
    try {
      const res = await axios.get('http://localhost:5000/society/all');
      setSocieties(res.data);
    } catch (err) {
      console.error('Error fetching societies:', err);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/society/add', form);
      alert('Society added successfully!');
      setForm({ name: '', address: '', city: '', pincode: '' });
      fetchSocieties();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="addsociety-container">
        <div className="addsociety-box">
          <div className="addsociety-left">
            <h1>Add New Society</h1>
            <p className="subtitle">Register your society with full details.</p>
            <img src={SocietyImg} alt="Society Illustration" className="addsociety-image" />
          </div>

          <div className="addsociety-right">
            <form onSubmit={handleSubmit} className="addsociety-form">
              <div className="form-group">
                <label>Society Name:</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Address:</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>City:</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Pincode:</label>
                <input type="number" name="pincode" value={form.pincode} onChange={handleChange} required />
              </div>

              <button type="submit" className="addsociety-btn">Add Society</button>
            </form>
          </div>
        </div>
      </div>
       <div className="society-list">
            <h3>All Societies</h3>
            <div className="society-cards">
            {societies.map((s, index) => (
                <div
                key={index}
                className="society-card"
                title={`Name: ${s.name}\nAddress: ${s.address}, ${s.city} - ${s.pincode}`}
                >
                <h4>{s.name}</h4>
                </div>
            ))}
            </div>
        </div>
    </>
  );
};

export default AddSociety;
