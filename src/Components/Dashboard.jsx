import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import Navbar from "./Navbar";
import "./CSS/Dashboard.css";

const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [role, setRole] = useState(
    () => localStorage.getItem("userRole") || "resident",
  );
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    message: "",
    description: "",
    time: "",
    location: "",
  });
  const [posterFile, setPosterFile] = useState(null);

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const endpoints = {
          events:
            role === "admin"
              ? `${API_BASE}/admin-events`
              : `${API_BASE}/resident-events`,
          notices:
            role === "admin"
              ? `${API_BASE}/admin-notices`
              : `${API_BASE}/resident-notices`,
        };

        const [eventRes, noticeRes] = await Promise.all([
          axios.get(endpoints.events, config),
          axios.get(endpoints.notices, config),
        ]);

        setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
        setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);
      } catch (err) {
        console.error("Data fetching error:", err);
      }
    };

    fetchData();
  }, [role]);

  const openForm = (type) => {
    if (role === "admin") {
      setFormType(type);
      setFormData({
        title: "",
        date: "",
        message: "",
        description: "",
        time: "",
        location: "",
      });
      setPosterFile(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (formType === "events") {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("date", formData.date);
      formPayload.append("time", formData.time);
      formPayload.append("location", formData.location);
      formPayload.append("image", posterFile);

      try {
        const res = await axios.post(
          `${API_BASE}/admin-events/upload`,
          formPayload,
          config,
        );
        setEvents((prev) => [...prev, res.data]);
        setFormType(null);
        setPosterFile(null);
      } catch (err) {
        console.error("Event upload failed:", err);
      }
    } else if (formType === "notices") {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const payload = { message: formData.message };
        const res = await axios.post(
          `${API_BASE}/admin-notices`,
          payload,
          config,
        );
        setNotices((prev) => [...prev, res.data]);
        setFormType(null);
      } catch (err) {
        console.error("Notice creation failed:", err);
      }
    }
  };

  const handleDelete = async (type, id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin-${type}/${id}`, config);

      if (type === "events") setEvents(events.filter((e) => e._id !== id));
      if (type === "notices") setNotices(notices.filter((n) => n._id !== id));
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
            {role === "admin" && (
              <button onClick={() => openForm("events")}>+ Add Event</button>
            )}
            <ul>
              {events.map((item) => (
                <li key={item._id} className="event-item">
                  <div className="event-title">{item.title}</div>
                  <div className="event-date">
                    {item.date} {item.time && `| ${item.time}`}
                  </div>
                  <div className="event-description">{item.description}</div>
                  {item.location && (
                    <div>
                      <strong>Location:</strong> {item.location}
                    </div>
                  )}
                  {item.posterUrl && (
                    <img
                      src={item.posterUrl}
                      alt="Poster"
                      style={{ maxWidth: "100%", marginTop: "0.5rem" }}
                    />
                  )}
                  {role === "admin" && (
                    <button onClick={() => handleDelete("events", item._id)}>
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="split-section notices-section">
            <h3>Notices</h3>
            {role === "admin" && (
              <button onClick={() => openForm("notices")}>+ Add Notice</button>
            )}
            <ul>
              {notices.map((item) => (
                <li key={item._id} className="notice-item">
                  <div className="notice-header">{item.message}</div>
                  {item.date && (
                    <div className="notice-meta">
                      Date: {format(new Date(item.date), "dd-MM-yyyy hh:mm a")}
                    </div>
                  )}
                  {item.postedBy && (
                    <div className="notice-meta">
                      Posted by: {item.postedBy}
                    </div>
                  )}
                  {role === "admin" && (
                    <button onClick={() => handleDelete("notices", item._id)}>
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {formType && (
          <form className="dashboard-form" onSubmit={handleFormSubmit}>
            <h4>Add {formType.charAt(0).toUpperCase() + formType.slice(1)}</h4>

            {formType === "events" && (
              <>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Poster Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </>
            )}

            {formType === "notices" && (
              <div className="form-group">
                <label>Notice Message</label>
                <input
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <button type="submit" className="dashboard-submit-button">
                Submit
              </button>
              <button
                type="button"
                className="dashboard-submit-button"
                onClick={() => setFormType(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
