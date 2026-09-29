import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./css/Amenities.css";

import turfImg from "../assets/turf.png";
import poolImg from "../assets/swimming-pool.png";
import gymImg from "../assets/gym.png";
import beautyImg from "../assets/beauty-parlour.png";
import libraryImg from "../assets/library.png";
import clubhouseImg from "../assets/clubhouse.png";
import multipurposeImg from "../assets/multipurposehall.png";
import BookingHistory from "./BookingHistory";

const amenityImageMap = {
  Turf: turfImg,
  "Swimming Pool": poolImg,
  Gym: gymImg,
  "Beauty Parlour": beautyImg,
  Library: libraryImg,
  "Club House": clubhouseImg,
  "Multipurpose Hall": multipurposeImg,
};

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchAmenities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/amenities");
      setAmenities(res.data);
    } catch (err) {
      console.error("Error fetching amenities:", err);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleAmenityClick = (amenity) => {
    if (selectedAmenity && selectedAmenity._id === amenity._id) {
      setSelectedAmenity(null);
    } else if (amenity.available_slots <= 0) {
      alert("No slots available for this amenity.");
    } else {
      setSelectedAmenity(amenity);
      setFormData({ date: "", time: "" });
      setMessage("");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time) {
      setMessage("❗Please fill in both date and time.");
      return;
    }

    const payload = {
      amenity_id: selectedAmenity._id,
      booking_date: formData.date,
      start_time: formData.time,
      end_time: formData.time,
    };

    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post("http://localhost:5000/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Booking successful!");
      setFormData({ date: "", time: "" });
      setSelectedAmenity(null);
      fetchAmenities(); // refresh slots
    } catch (error) {
      console.error("Booking Error:", error);
      if (error.response && error.response.status === 401) {
        setMessage("⛔ Unauthorized. Please login again.");
      } else {
        setMessage("⚠️ Server error.");
      }
    }
  };

  return (
    <div className="page-content">
      <Navbar />
      <h2 className="section-title">Available Amenities</h2>

      <div className="amenity-grid">
        {amenities.map((amenity, index) => (
          <div className="amenity-card" key={index}>
            <div
              className={`card-inner ${flippedCardId === amenity._id ? "flipped" : ""}`}
            >
              <div className="card-front">
                <img
                  src={amenityImageMap[amenity.type] || gymImg}
                  alt={amenity.name}
                  className="amenity-image"
                />
                <div className="amenity-info">
                  <h3>{amenity.name}</h3>
                  <p>
                    <strong>Location:</strong> 📍 {amenity.location}
                  </p>
                  <p>
                    <strong>Slots:</strong> {amenity.available_slots}
                  </p>
                  <button
                    className="book-btn"
                    disabled={amenity.available_slots <= 0}
                    onClick={() => handleAmenityClick(amenity)}
                  >
                    {amenity.available_slots > 0
                      ? "Book Now"
                      : "No Slots Available"}
                  </button>
                  <button
                    className="rules-btn"
                    onClick={() =>
                      setFlippedCardId(
                        flippedCardId === amenity._id ? null : amenity._id,
                      )
                    }
                  >
                    ℹ️ View Rules
                  </button>
                </div>
              </div>

              <div className="card-back">
                <h3>Rules</h3>
                <p>{amenity.rules}</p>
                <button
                  className="rules-btn"
                  onClick={() => setFlippedCardId(null)}
                >
                  🔙 Back
                </button>
              </div>
            </div>

            {selectedAmenity && selectedAmenity._id === amenity._id && (
              <div className="mini-booking-form">
                <div className="form-group">
                  <label>Booking Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Booking Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
                <button className="submit-btn" onClick={handleSubmit}>
                  Submit Booking
                </button>
                {message && <p className="feedback">{message}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
      <BookingHistory />
    </div>
  );
};

export default Amenities;
