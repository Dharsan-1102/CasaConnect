import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import FlatImg from '../assets/flat.png';
import './CSS/AddFlat.css';

const AddFlat = () => {
  const [apartments, setApartments] = useState([]);
  const [flats, setFlats] = useState([]);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({
    flat_number: '',
    block: '',
    floor: '',
    type: '',
    status: 'Vacant',
    apartment_id: '',
    owner_id: '',
    tenant_id: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/apartment/all')
      .then(res => {
        if (Array.isArray(res.data)) {
          setApartments(res.data);
        } else {
          setApartments([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch apartments:', err);
        setApartments([]);
      });

    axios.get('http://localhost:5000/flat/all')
      .then(res => {
        if (Array.isArray(res.data)) {
          setFlats(res.data);
        } else {
          setFlats([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch flats:', err);
        setFlats([]);
      });
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'floor' ? parseInt(value || 0) : value
    }));

    if (name === 'apartment_id') {
      try {
        const apt = apartments.find(a => a._id === value);
        const aptName = apt?.name;
        if (!aptName) return;

        const res = await axios.get(`http://localhost:5000/residents-by-apartment/${aptName}`);
        setResidents(res.data);
      } catch (err) {
        console.error('Failed to fetch residents:', err);
        setResidents([]);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        flat_number: form.flat_number,
        block: form.block,
        floor: parseInt(form.floor),
        type: form.type,
        status: form.status,
        apartment_id: form.apartment_id,
        owner_id: form.owner_id,
        tenant_id: form.tenant_id || null
      };

      await axios.post('http://localhost:5000/flat/add', payload);
      alert('Flat added successfully!');
      setForm({ flat_number: '', block: '', floor: '', type: '', status: 'Vacant', apartment_id: '', owner_id: '', tenant_id: '' });

      const updated = await axios.get('http://localhost:5000/flat/all');
      setFlats(updated.data);
    } catch (err) {
      console.error('Error adding flat:', err?.response?.data || err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-flat-container">
        <div className="add-flat-box">
          <div className="add-flat-left">
            <h1>Add Flat</h1>
            <p className="subtitle">Add flat information and assign owner/tenant</p>
            <img src={FlatImg} alt="Add Flat" className="add-flat-image" />
          </div>

          <div className="add-flat-right">
            <form className="add-flat-form" onSubmit={handleSubmit}>
              <div className="addflat-form-group">
                <label>Select Apartment</label>
                <select name="apartment_id" value={form.apartment_id} onChange={handleChange} required>
                  <option value="">Select Apartment</option>
                  {apartments.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>

              <div className="addflat-form-group">
                <label>Flat Number</label>
                <input name="flat_number" value={form.flat_number} onChange={handleChange} required />
              </div>

              <div className="addflat-form-group">
                <label>Block</label>
                <input name="block" value={form.block} onChange={handleChange} required />
              </div>

              <div className="addflat-form-group">
                <label>Floor</label>
                <input name="floor" type="number" value={form.floor} onChange={handleChange} required />
              </div>

              <div className="addflat-form-group">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                </select>
              </div>

              <div className="addflat-form-group">
                <label>Select Owner</label>
                <select name="owner_id" value={form.owner_id} onChange={handleChange} required>
                  <option value="">Select Owner</option>
                  {residents.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} - {r.flat} ({r.resident_role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="addflat-form-group">
                <label>Select Tenant (optional)</label>
                <select name="tenant_id" value={form.tenant_id} onChange={handleChange}>
                  <option value="">Select Tenant</option>
                  {residents.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} - {r.flat} ({r.resident_role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="addflat-form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                </select>
              </div>

              <button className="add-flat-btn" type="submit">Add Flat</button>
            </form>
          </div>
        </div>
      </div>

      <div className="flat-list">
        <h3>Existing Flats</h3>
        <div className="flat-cards">
          {flats.map(flat => (
            <div className="flat-card" key={flat._id}>
              <h4>{flat.flat_number} - {flat.block}</h4>
              <p>Floor: {flat.floor}</p>
              <p>Type: {flat.type}</p>
              <p>Status: {flat.status}</p>
              <p>Owner ID: {flat.owner_id?.name || flat.owner_id?._id || 'N/A'}</p>
              <p>Tenant ID: {flat.tenant_id?.name || flat.tenant_id?._id || 'N/A'}</p>
              <p>Apartment: {flat.apartment_id?.name || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AddFlat;
