import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Navbar from './Navbar';
import './css/Bills.css';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('All');
  const [residentId, setResidentId] = useState(null);

  const formatDateTime = (dateStr) => {
    return format(new Date(dateStr), 'dd-MM-yyyy hh:mm a');
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem('token');
        const profileRes = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resId = profileRes.data._id;
        setResidentId(resId);

        const billsRes = await axios.get(`http://localhost:5000/bills/by-resident/${resId}`);
        setBills(billsRes.data);
      } catch (err) {
        console.error('Failed to fetch bills:', err);
      }
    };

    fetchBills();
  }, []);

  const handleCategoryChange = (e) => {
    setFilter(e.target.value);
  };

  const handlePayNow = async (billId) => {
    try {
      await axios.post(`http://localhost:5000/bills/pay/${billId}`);
      setBills(prev =>
        prev.map(b => (b._id === billId ? { ...b, status: 'Paid' } : b))
      );
      alert('Payment successful!');
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Failed to complete payment');
    }
  };

  const filteredBills = bills.filter(bill =>
    filter === 'All' ? true : bill.category === filter
  );

  const unpaidBills = filteredBills.filter(b => b.status === 'Unpaid');
  const paidBills = filteredBills.filter(b => b.status === 'Paid');

  return (
    <div className="page-content">
      <Navbar />
      <div className="bills-container">
        <h2>Billing & Payments</h2>

        <div className="filter-section">
          <label>Filter by Category:</label>
          <select onChange={handleCategoryChange} value={filter}>
            <option value="All">All</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
          </select>
        </div>

        <h3>Unpaid Bills</h3>
        <table className="bills-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {unpaidBills.length > 0 ? unpaidBills.map(bill => (
              <tr key={bill._id}>
                <td>{bill._id}</td>
                <td>₹{bill.amount}</td>
                <td>{formatDateTime(bill.due_date)}</td>
                <td>{bill.category}</td>
                <td>
                  <button className="pay-btn" onClick={() => handlePayNow(bill._id)}>
                    Pay Now
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5">No unpaid bills found.</td></tr>
            )}
          </tbody>
        </table>

        <h3>Payment History</h3>
        <table className="bills-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Amount</th>
              <th>Paid On</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paidBills.length > 0 ? paidBills.map(bill => (
              <tr key={bill._id}>
                <td>{bill._id}</td>
                <td>₹{bill.amount}</td>
                <td>{bill.paid_on ? formatDateTime(bill.paid_on) : 'N/A'}</td>
                <td>{bill.category}</td>
                <td className="paid">Paid</td>
              </tr>
            )) : (
              <tr><td colSpan="5">No paid bills yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bills;
