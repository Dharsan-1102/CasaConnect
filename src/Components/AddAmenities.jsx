import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./CSS/AddAmenities.css";
import turfImg from "../assets/turf.png";
import poolImg from "../assets/swimming-pool.png";
import gymImg from "../assets/gym.png";
import beautyImg from "../assets/beauty-parlour.png";

const amenityImages = [turfImg, poolImg, gymImg, beautyImg];

const AddAmenities = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    rules: "",
    available_slots: "",
  });

  const [message, setMessage] = useState("");
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % amenityImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/amenities",
        formData,
      );

      if (response.status === 200 || response.status === 201) {
        setMessage("Amenity added successfully!");
        setFormData({
          name: "",
          type: "",
          location: "",
          rules: "",
          available_slots: "",
        });
      } else {
        setMessage("Failed to add amenity.");
      }
    } catch (error) {
      console.error("Error adding amenity:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-amenities-container">
        <div className="add-amenities-box">
          <div className="add-amenities-left">
            <h1>Add Amenity</h1>
            <p className="subtitle">Manage community amenities with ease</p>
            <img
              src={amenityImages[currentImgIndex]}
              alt="Amenity"
              className="add-amenities-image"
            />
          </div>

          <div className="add-amenities-right">
            <form className="add-amenities-form" onSubmit={handleSubmit}>
              <div className="add-amenities-form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Amenity Type</option>
                  <option value="Gym">Gym</option>
                  <option value="Turf">Turf</option>
                  <option value="Swimming Pool">Swimming Pool</option>
                  <option value="Beauty Parlour">Beauty Parlour</option>
                  <option value="Library">Library</option>
                  <option value="Club House">Club House</option>
                  <option value="Multipurpose Hall">Multipurpose Hall</option>
                </select>
              </div>
              <div className="add-amenities-form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-amenities-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-amenities-form-group">
                <label>Rules</label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="add-amenities-form-group">
                <label>Available Slots</label>
                <input
                  type="number"
                  name="available_slots"
                  value={formData.available_slots}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="add-amenities-btn" type="submit">
                Add Amenity
              </button>
              {message && <p className="form-message">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAmenities;
