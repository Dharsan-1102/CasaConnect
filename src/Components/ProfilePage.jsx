import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token === "guest-token") {
          setUser({
            name: "Guest Admin",
            role: "admin",
            email: "guest@casaconnect.com",
            apartment: "CasaConnect Demo",
            flat: "A-101",
            profile_photo_url: ""
          });
          return;
        }
        const res = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  if (error) return <p className="profile-error">{error}</p>;
  if (!user) return <p className="profile-loading">Loading profile...</p>;
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/profile/upload-photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUser((prev) => ({ ...prev, profile_photo_url: res.data.url }));
      setSelectedImage(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={() => window.history.back()}>
            &larr; Back
          </button>
          <h2>CASACONNECT</h2>
        </div>

        <h2>Your Profile</h2>
        <div className="profile-photo-wrapper">
          <label htmlFor="photo-upload" className="edit-photo-label">
            <img
              src={user.profile_photo_url || "../assets/signup.png"}
              alt="Profile"
              className="profile-photo"
            />
            <span className="edit-text">✏️ Edit</span>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {uploading && <p style={{ textAlign: "center" }}>Uploading...</p>}
        </div>

        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Apartment:</strong> {user.apartment}
        </p>
        <p>
          <strong>Flat:</strong> {user.flat}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>

        {user.role === "resident" && (
          <>
            <p>
              <strong>Phone:</strong> {user.phone_number}
            </p>
            <p>
              <strong>Block:</strong> {user.block}
            </p>
            <p>
              <strong>Resident Role:</strong> {user.resident_role}
            </p>
            <p>
              <strong>Status:</strong> {user.status}
            </p>
          </>
        )}

        {user.role === "guard" && (
          <>
            <p>
              <strong>Phone:</strong> {user.phone_number}
            </p>
            <p>
              <strong>Shift Time:</strong> {user.shift_time}
            </p>
          </>
        )}

        {user.role === "maintenance" && (
          <>
            <p>
              <strong>Phone:</strong> {user.phone_number}
            </p>
            <p>
              <strong>Specialization:</strong> {user.specialization}
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
