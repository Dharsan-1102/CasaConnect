import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import Navbar from "./Navbar";
import "./CSS/Dashboard.css";

const GuardDashboard = () => {
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
    posterUrl: "",
  });

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
        posterUrl: "",
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line no-unused-vars
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    let payload = {};
    let url = "";

    if (formType === "events") {
      url = `${API_BASE}/admin-events`;
      payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        posterUrl: formData.posterUrl,
      };
    } else if (formType === "notices") {
      url = `${API_BASE}/admin-notices`;
      payload = { message: formData.message };
    }

    try {
      const res = await axios.post(url, payload, config);
      if (formType === "events") setEvents((prev) => [...prev, res.data]);
      if (formType === "notices") setNotices((prev) => [...prev, res.data]);

      setFormType(null);
    } catch (err) {
      console.error(`Add ${formType} failed:`, err);
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
                  <div className="notice-meta">
                    Date: {format(new Date(item.date), "dd-MM-yyyy hh:mm a")}
                  </div>{" "}
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
      </div>
    </div>
  );
};

export default GuardDashboard;
