import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './CSS/CheckedInVisitors.css';

const CheckedInVisitors = () => {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/visitors-checkedin')
      .then(res => setVisitors(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleCheckout = async (visitorId) => {
    try {
      await axios.put(`http://localhost:5000/checkout/${visitorId}`);
      alert('Visitor checked out successfully!');
      setVisitors(prev => prev.filter(v => v._id !== visitorId));
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <>
    <div className="checkedin-wrapper">
      <Navbar />
      <h2 className="checkedin-title">Currently Checked-In Visitors</h2>
      <div className="visitors-grid">
        {visitors.map(visitor => (
          <div key={visitor._id} className="visitor-card">
            <h3>{visitor.name}</h3>
            <p><strong>Flat:</strong> {visitor.flat_number}</p>
            <p><strong>Purpose:</strong> {visitor.purpose}</p>
            <button onClick={() => handleCheckout(visitor._id)}>Check Out</button>
          </div>
        ))}
        {visitors.length === 0 && (
          <p className="empty-message">No visitors are currently checked in.</p>
        )}
      </div>
    </div>
    </>
  );
};

export default CheckedInVisitors;
