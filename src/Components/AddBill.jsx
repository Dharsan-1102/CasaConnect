import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./CSS/AddBill.css";
import BillImg from "../assets/bill.png";

const AddBill = () => {
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({
    resident_id: "",
    amount: "",
    category: "",
    due_date: "",
  });

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const apartment = localStorage.getItem("userApartment");
        const res = await axios.get(
          `http://localhost:5000/residents-by-apartment/${apartment}`,
        );
        setResidents(res.data);
      } catch (err) {
        console.error("Failed to fetch residents:", err);
      }
    };
    fetchResidents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/bills/create", form);
      alert("Bill created successfully");
      setForm({ resident_id: "", amount: "", category: "", due_date: "" });
    } catch (err) {
      console.error("Error creating bill:", err);
      alert("Failed to create bill");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-bill-container">
        <div className="add-bill-box">
          <div className="add-bill-left">
            <h1>Add Bill</h1>
            <p className="subtitle">
              Fill the form to create a bill for a resident
            </p>
            <img src={BillImg} alt="Add Bill" className="add-bill-image" />
          </div>

          <div className="add-bill-right">
            <form className="add-bill-form" onSubmit={handleSubmit}>
              <div className="addbill-form-group">
                <label>Resident</label>
                <select
                  name="resident_id"
                  value={form.resident_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Resident</option>
                  {residents.map((resident) => (
                    <option key={resident._id} value={resident._id}>
                      {resident.name} ({resident.flat})
                    </option>
                  ))}
                </select>
              </div>

              <div className="addbill-form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="addbill-form-group">
                <label>Bill Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Water">Water</option>
                  <option value="Electricity">Electricity</option>
                </select>
              </div>

              <div className="addbill-form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="add-bill-btn">
                Create Bill
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBill;
