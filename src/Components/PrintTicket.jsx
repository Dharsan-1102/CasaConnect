import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CSS/PrintTicket.css';
import DefaultAvatar from '../assets/default-avatar.png';

const PrintTicket = () => {
  const { logId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/accesslog/${logId}`)
      .then(res => {
        setTicket(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setLoading(false);
      });
  }, [logId]);

  if (loading) {
    return (
      <div className="ticket-wrapper">
        <div className="ticket-container">
          <p>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !ticket.visitor) {
    return (
      <div className="ticket-wrapper">
        <div className="ticket-container">
          <p>Error loading ticket details.</p>
        </div>
      </div>
    );
  }

  const {
    name,
    flat_number,
    purpose,
    photo_url
  } = ticket.visitor;
  const approvedByName = ticket.approved_by?.name || 'N/A';

  return (
    <div className="ticket-wrapper">
      <div className="ticket-container">
        <div className="ticket-header">
          <h3>Visitor Entry Pass</h3>
        </div>
        <img
          src={photo_url || DefaultAvatar}
          alt="Visitor"
          className="ticket-photo"
          onError={(e) => { e.target.src = DefaultAvatar; }}
        />
        <div className="ticket-info">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Flat:</strong> {flat_number}</p>
          <p><strong>Purpose:</strong> {purpose}</p>
          <p><strong>Check-in:</strong> {new Date(ticket.entry_time).toLocaleString()}</p>
          <p><strong>Entry Point:</strong> {ticket.entry_point}</p>
          <p><strong>Approved By:</strong> {approvedByName}</p>
        </div>
        <button className="ticket-print-btn" onClick={() => window.print()}>
          Print
        </button>
      </div>
    </div>
  );
};

export default PrintTicket;
