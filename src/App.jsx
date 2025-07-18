import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import RequireRole from './Components/RequireRole';
import CheckedInVisitors from './Components/CheckedInVisitors'; 
import PrintTicket from './Components/PrintTicket';
import ProfilePage from './Components/ProfilePage';
import ForgotPassword from './Components/ForgotPassword';
import Navbar from './Components/Navbar';
import Maintenance from './Components/Maintenance';
import Visitors from './Components/Visitors';
import Amenities from './Components/Amenities';
import Bills from './Components/Bills';
import Users from './Components/Users';
import AcceptResidents from './Components/AcceptResidents';
import AddAmenities from './Components/AddAmenities';
import AddSociety from './Components/AddSociety';
import AddApartment from './Components/AddApartment';
import AddFlat from './Components/AddFlat';
import BookingHistory from './Components/BookingHistory';
import MaintenanceDashboard from './Components/MaintenanceDashboard';
import GuardDashboard from './Components/GuardDashboard';
import ResidentDashboard from './Components/ResidentDashboard';
import ExistingUsers from './Components/ExistingUsers';
import AddBill from './Components/AddBill';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/navbar" element={<Navbar />} />
        
        {/* Dashboards for specific roles */}
        <Route path="/admin" element={<RequireRole allowedRole="admin"><Dashboard /></RequireRole>} />
        <Route path="/resident" element={<RequireRole allowedRole="resident"><ResidentDashboard /></RequireRole>} />
        <Route path="/maintenance-dashboard" element={<RequireRole allowedRole="maintenance"><MaintenanceDashboard /></RequireRole>} />
        <Route path="/guard-dashboard" element={<RequireRole allowedRole="guard"><GuardDashboard /></RequireRole>} />

        <Route path="/checked-in" element={<CheckedInVisitors />} />

        {/* Shared pages */}
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/visitors" element={<Visitors />} />
        <Route path="/amenities" element={<Amenities />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/admin/add-bill" element={<RequireRole allowedRole="admin"><AddBill /></RequireRole>} />

        <Route path="/print-ticket/:logId" element={<PrintTicket />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/accept-residents" element={<RequireRole allowedRole="admin"><AcceptResidents /></RequireRole>} />
        <Route path="/admin/add-amenities" element={<RequireRole allowedRole="admin"><AddAmenities /></RequireRole>} />
        <Route path="/admin/add-society" element={<RequireRole allowedRole="admin"><AddSociety /></RequireRole>} />
        <Route path="/admin/add-apartment" element={<RequireRole allowedRole="admin"><AddApartment /></RequireRole>} />
        <Route path="/admin/add-flat" element={<RequireRole allowedRole="admin"><AddFlat /></RequireRole>} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/admin/users/create" element={<Users />} />
        <Route path="/admin/users/existing" element={<ExistingUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
