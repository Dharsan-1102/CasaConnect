import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import Navbar from './Navbar';
import './CSS/Dashboard.css';

const ResidentDashboard = () => {
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'resident');
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    message: '',
    description: '',
    time: '',
    location: '',
    posterUrl: ''
  });

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const endpoints = {
          events: role === 'admin' ? `${API_BASE}/admin-events` : `${API_BASE}/resident-events`,
          notices: role === 'admin' ? `${API_BASE}/admin-notices` : `${API_BASE}/resident-notices`,
        };

        const [eventRes, noticeRes] = await Promise.all([
          axios.get(endpoints.events, config),
          axios.get(endpoints.notices, config),
        ]);

        setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
        setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);
      } catch (err) {
        console.error('Data fetching error:', err);
      }
    };

    fetchData();
  }, [role]);

  const handleRSVP = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      await axios.post(`${API_BASE}/admin-events-rsvp/${eventId}`, { email }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId && !event.rsvp.includes(email)
            ? { ...event, rsvp: [...event.rsvp, email] }
            : event
        )
      );

      alert('RSVP Submitted');
    } catch (err) {
      console.error('RSVP failed:', err);
    }
  };

  const openForm = (type) => {
    if (role === 'admin') {
      setFormType(type);
      setFormData({
        title: '',
        date: '',
        message: '',
        description: '',
        time: '',
        location: '',
        posterUrl: ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    let payload = {};
    let url = '';

    if (formType === 'events') {
      url = `${API_BASE}/admin-events`;
      payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        posterUrl: formData.posterUrl,
      };
    } else if (formType === 'notices') {
      url = `${API_BASE}/admin-notices`;
      payload = { message: formData.message };
    }

    try {
      const res = await axios.post(url, payload, config);
      if (formType === 'events') setEvents(prev => [...prev, res.data]);
      if (formType === 'notices') setNotices(prev => [...prev, res.data]);

      setFormType(null);
    } catch (err) {
      console.error(`Add ${formType} failed:`, err);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin-${type}/${id}`, config);

      if (type === 'events') setEvents(events.filter(e => e._id !== id));
      if (type === 'notices') setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      console.error(`Delete ${type} failed:`, err);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-split">
          <div className="split-section events-section">
            <h3>Events</h3>
            {role === 'admin' && <button onClick={() => openForm('events')}>+ Add Event</button>}
            <ul>
              {events.map(event => (
                <li key={event._id} className="event-item">
                  <div className="event-title">{event.title}</div>
                  <div className="event-date">{event.date} {event.time && `| ${event.time}`}</div>
                  <div className="event-description">{event.description}</div>
                  {event.location && <div><strong>Location:</strong> {event.location}</div>}
                  {event.posterUrl && (
                    <img src={event.posterUrl} alt="Poster" style={{ maxWidth: '100%', marginTop: '0.5rem' }} />
                  )}
                  {role === 'admin' && (
                    <button onClick={() => handleDelete('events', event._id)}>Delete</button>
                  )}
                  {role === 'resident' && (
                    <button className="rsvp-button" onClick={() => handleRSVP(event._id)}>RSVP</button>
                  )}
                  {event.rsvp?.length > 0 && (
                    <div className="rsvp-count">
                      RSVPs: <strong>{event.rsvp.length}</strong>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="split-section notices-section">
            <h3>Notices</h3>
            {role === 'admin' && <button onClick={() => openForm('notices')}>+ Add Notice</button>}
            <ul>
              {notices.map(notice => (
                <li key={notice._id} className="notice-item">
                  <div className="notice-header">{notice.message}</div>
                    <div className="notice-meta">
                      Date: {format(new Date(notice.date), 'dd-MM-yyyy hh:mm a')}
                    </div>                  {notice.postedBy && <div className="notice-meta">Posted by: {notice.postedBy}</div>}
                  {role === 'admin' && (
                    <button onClick={() => handleDelete('notices', notice._id)}>Delete</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {formType && (
          <form className="dashboard-form" onSubmit={handleFormSubmit}>
            <h4>Add {formType === 'events' ? 'Event' : 'Notice'}</h4>

            {formType === 'events' && (
              <>
                <div className="form-group">
                  <label>Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Event Title" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Event Description" required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input name="time" value={formData.time} onChange={handleInputChange} placeholder="Time (e.g. 5:30 PM)" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Venue / Location" />
                </div>
                <div className="form-group">
                  <label>Poster URL</label>
                  <input name="posterUrl" value={formData.posterUrl} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </>
            )}

            {formType === 'notices' && (
              <div className="form-group">
                <label>Notice Message</label>
                <input name="message" value={formData.message} onChange={handleInputChange} placeholder="Type your notice..." required />
              </div>
            )}

            <div className="form-group">
              <button type="submit" className="dashboard-submit-button">Submit</button>
              <button type="button" className="dashboard-submit-button" onClick={() => setFormType(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboard;
