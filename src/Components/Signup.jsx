import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/Signup.css";
import signupImage from "../assets/signup.png";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    apartment: "",
    flat: "",
    email: "",
    password: "",
    otp: "",
    phone_number: "",
    block: "",
    resident_role: "",
    profile_photo_url: "",
    status: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOTP = async () => {
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/send-otp", {
        email: form.email,
      });
      if (res.data.success) {
        alert("OTP sent to your email");
        setOtpSent(true);
      }
    } catch {
      setError("Failed to send OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.",
      );
      return;
    }

    if (!form.otp || form.otp.length < 4) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post("http://localhost:5000/signup", form);
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-left">
          <h1>CasaConnect Signup</h1>
          <p className="subtitle">Join your apartment community</p>
          <img src={signupImage} alt="Signup" className="signup-image" />
        </div>

        <div className="signup-right">
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Apartment</label>
              <input
                type="text"
                name="apartment"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Flat No</label>
              <input type="text" name="flat" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Block</label>
              <input
                type="text"
                name="block"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Resident Role</label>
              <select name="resident_role" onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Owner">Owner</option>
                <option value="Tenant">Tenant</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profile Photo URL</label>
              <input
                type="text"
                name="profile_photo_url"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value.trim().toLowerCase(),
                  }))
                }
                required
              />
            </div>

            <button type="button" className="signup-btn" onClick={sendOTP}>
              Send OTP
            </button>
            <button 
              type="button" 
              className="signup-btn"
              style={{ marginTop: "15px", backgroundColor: "#6c757d" }}
              onClick={() => {
                localStorage.setItem("token", "guest-token");
                localStorage.setItem("userRole", "admin");
                localStorage.setItem("userName", "Guest Admin");
                localStorage.setItem("userId", "guest-id");
                localStorage.setItem("userApartment", "Guest Apartment");
                window.location.href = "/admin";
              }}
            >
              Guest Mode
            </button>

            {otpSent && (
              <>
                <div className="form-group">
                  <label>OTP</label>
                  <input
                    type="text"
                    name="otp"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="signup-btn">
                  Register
                </button>
              </>
            )}

            {error && <p className="signup-error-msg">{error}</p>}
            <p className="signup-login-link">
              Already have an account? <a href="/login">Login here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
