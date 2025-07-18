import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './CSS/GuardVisitorForm.css';
import VisitorImg from '../assets/visitor-img.png';

const GuardVisitorForm = () => {
  const [residents, setResidents] = useState([]);
  const role = localStorage.getItem('userRole');
  const apartment = localStorage.getItem('userApartment');
  const [loggedInUser, setLoggedInUser] = useState({
  id: localStorage.getItem('userId'),
  name: localStorage.getItem('userName'),
});

  const [flats, setFlats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (apartment) {
          const resResidents = await axios.get(`http://localhost:5000/residents-by-apartment/${apartment}`);
          const updatedResidents = [...resResidents.data];

          if (role === 'guard') {
            updatedResidents.push({ _id: loggedInUser.id, name: loggedInUser.name, flat: 'Security' });
          }

          setResidents(updatedResidents);

          const resFlats = await axios.get(`http://localhost:5000/flat/by-apartment/${apartment}`);
          setFlats(resFlats.data);
        }
      } catch (err) {
        console.error('Failed to fetch residents or flats:', err);
      }
    };

    fetchData();
  }, [apartment, role, loggedInUser.id, loggedInUser.name]);

  const [visitor, setVisitor] = useState({
    name: '', phone_number: '', vehicle_number: '',
    purpose: '', flat_number: '', photo_url: '',
    approved_by: '', entry_point: ''
  });

  const handleChange = e => {
    setVisitor({ ...visitor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/visitor-add', visitor);
      alert("Visitor logged successfully!");
      window.open(`/print-ticket/${res.data.log._id}`, '_blank');
    } catch (err) {
      console.error('Error logging visitor:', err);
    }
  };

  return (
    <div className="guard-visitor-container">
      <div className="guard-visitor-box">
        <div className="guard-visitor-left">
          <img src={VisitorImg} alt="Visitor" className="guard-visitor-image" />
          <h2>Welcome, Guard!</h2>
          <p className="subtitle">Log visitor details and generate a ticket</p>
        </div>

        <div className="guard-visitor-right">
          <form className="guard-visitor-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Log New Visitor</h2>

            <div className="guard-form-group">
              <label>Name:</label>
              <input name="name" onChange={handleChange} required />
            </div>

            <div className="guard-form-group">
              <label>Phone Number:</label>
              <input name="phone_number" onChange={handleChange} required />
            </div>

            <div className="guard-form-group">
              <label>Vehicle Number:</label>
              <input name="vehicle_number" onChange={handleChange} />
            </div>

            <div className="guard-form-group">
              <label>Purpose:</label>
              <input name="purpose" onChange={handleChange} />
            </div>

            <div className="guard-form-group">
              <label>Flat Number:</label>
              <select name="flat_number" value={visitor.flat_number} onChange={handleChange} required>
                <option value="">Select Flat</option>
                {flats.map(flat => (
                  <option key={flat._id} value={flat.flat_number}>
                    {flat.flat_number} - Block {flat.block}
                  </option>
                ))}
              </select>
            </div>

            <div className="guard-form-group">
              <label>Approved By (Resident / Gaurd):</label>
              <select name="approved_by" onChange={handleChange} required>
                <option value="">Select Resident</option>
                {residents.map(res => (
                  <option key={res._id} value={res._id}>
                    {res.name} ({res.flat})
                  </option>
                ))}
              </select>
            </div>

            <div className="guard-form-group">
              <label>Entry Point:</label>
              <input name="entry_point" onChange={handleChange} />
            </div>

            <button type="submit" className="guard-submit-btn">Generate Ticket</button>

            <Link to="/checked-in" className="guard-view-btn">View Checked-In Visitors</Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuardVisitorForm;
