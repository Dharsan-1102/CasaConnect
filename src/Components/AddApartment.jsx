import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./CSS/AddApartment.css";
import ApartmentImg from "../assets/add-apartment.png";

const AddApartment = () => {
  const [societies, setSocieties] = useState([]);
  const [customSociety, setCustomSociety] = useState("");
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    society_id: "",
    total_blocks: "",
    total_flats: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/society/all")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setSocieties(res.data);
        } else {
          setSocieties([]);
        }
      })

      .catch((err) => {
        console.error("Error fetching societies:", err);
        setSocieties([]);
      });

    axios
      .get("http://localhost:5000/apartment/all")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setApartments(res.data);
        } else {
          setApartments([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching apartments:", err);
        setApartments([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let societyId = form.society_id;

    try {
      if (!societyId && customSociety) {
        const newSoc = await axios.post("http://localhost:5000/society/add", {
          name: customSociety,
        });
        societyId = newSoc.data._id;
      }

      const payload = {
        name: form.name,
        society_id: societyId,
        total_blocks: form.total_blocks,
        total_flats: form.total_flats,
      };

      await axios.post("http://localhost:5000/apartment/add", payload);
      alert("Apartment added successfully!");
      setForm({ name: "", society_id: "", total_blocks: "", total_flats: "" });
      setCustomSociety("");

      const updated = await axios.get("http://localhost:5000/apartment/all");
      setApartments(updated.data);
    } catch (err) {
      console.error("Error adding apartment:", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="add-apartment-container">
        <div className="add-apartment-box">
          <div className="add-apartment-left">
            <h1>Add Apartment</h1>
            <p className="subtitle">
              Link your apartment to an existing or new society
            </p>
            <img
              src={ApartmentImg}
              alt="Add Apartment"
              className="add-apartment-image"
            />
          </div>

          <div className="add-apartment-right">
            <form className="add-apartment-form" onSubmit={handleSubmit}>
              <div className="addapartment-form-group">
                <label>Choose Society</label>
                <select
                  name="society_id"
                  value={form.society_id}
                  onChange={handleChange}
                >
                  <option value="">Select Society</option>
                  {Array.isArray(societies) && societies.length > 0 ? (
                    societies.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No societies found</option>
                  )}
                </select>
              </div>

              <div className="addapartment-form-group">
                <label>Apartment Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Apartment Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="addapartment-form-group">
                <label>Total Blocks</label>
                <input
                  name="total_blocks"
                  type="number"
                  placeholder="Number of Blocks"
                  value={form.total_blocks}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="addapartment-form-group">
                <label>Total Flats</label>
                <input
                  name="total_flats"
                  type="number"
                  placeholder="Number of Flats"
                  value={form.total_flats}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="add-apartment-btn" type="submit">
                Add Apartment
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="apartment-list">
        <h3>Existing Apartments</h3>
        <div className="apartment-cards">
          {Array.isArray(apartments) && apartments.length > 0 ? (
            apartments.map((a) => (
              <div className="apartment-card" key={a._id}>
                <h4>{a.name}</h4>
                <p>Blocks: {a.total_blocks}</p>
                <p>Flats: {a.total_flats}</p>
                <p>Society: {a.society_id?.name || "N/A"}</p>
              </div>
            ))
          ) : (
            <p>No apartments found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AddApartment;
