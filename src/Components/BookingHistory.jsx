import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/BookingHistory.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const formatDate = (dateStr) => {
  const [year, month, day] = new Date(dateStr).toISOString().split('T')[0].split('-');
  return `${day}-${month}-${year}`;
};

  const fetchBookingHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setMessage('Failed to load booking history.');
    }
  };

  const cancelBooking = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Booking cancelled successfully.');
      fetchBookingHistory(); 
    } catch (err) {
      console.error('Cancel error:', err);
      setMessage('Error cancelling booking.');
    }
  };

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  return (
    <div className="booking-history-page">
      <h2 className="title">📋 Your Booking History</h2>
      {message && <p className="msg">{message}</p>}

      {bookings.length === 0 ? (
        <p className="no-history">No bookings made yet.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <h3>{booking.amenity_id?.name || 'Amenity'}</h3>
            <p><strong>Date:</strong> {formatDate(booking.booking_date)}</p>
            <p><strong>Time:</strong> {booking.start_time}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <button className="cancel-btn" onClick={() => cancelBooking(booking._id)}>
              ❌ Cancel Booking
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default BookingHistory;
