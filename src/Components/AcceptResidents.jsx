import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './css/AcceptResidents.css';

const AcceptResidents = () => {
  const [residents, setResidents] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchResidentsByStatus(filter);
  }, [filter]);

  const fetchResidentsByStatus = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/residents/${status}`);
      const data = await response.json();
      setResidents(data);
    } catch (err) {
      console.error('Error fetching residents:', err);
      setMessage('Failed to fetch residents.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/residents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessage(`Resident ${newStatus} successfully.`);
        fetchResidentsByStatus(filter);
      } else {
        setMessage('Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Server error.');
    }
  };

  return (
    <div className="page-content">
      <Navbar />
      <div className="resident-container">
        <div className="header-section">
          <h2>Manage Resident Requests</h2>
          <p>Select and review residents based on their application status.</p>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="status-filter">
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {message && <div className="form-message">{message}</div>}

        {loading ? (
          <p className="loading-message">Loading residents...</p>
        ) : residents.length === 0 ? (
          <p className="no-residents">No residents with status: {filter}</p>
        ) : (
          <div className="resident-list">
            {residents.map(resident => (
              <div key={resident._id} className="resident-card">
                <h4>{resident.name}</h4>
                <p><strong>Email:</strong> {resident.email}</p>
                <p><strong>Phone:</strong> {resident.phone}</p>
                <p><strong>Status:</strong> {resident.status}</p>

                {filter === 'pending' && (
                  <div className="resident-actions">
                    <button className="accept-btn" onClick={() => updateStatus(resident._id, 'accepted')}>Accept</button>
                    <button className="reject-btn" onClick={() => updateStatus(resident._id, 'rejected')}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptResidents;
