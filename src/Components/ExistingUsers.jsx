import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/ExistingUsers.css";
import Navbar from "./Navbar";

const ExistingUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const fetchUsersByApartment = async () => {
      try {
        let apartment = localStorage.getItem("userApartment");
        if (!apartment) {
          const token = localStorage.getItem("token");
          const profileRes = await axios.get("http://localhost:5000/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          apartment = profileRes.data.apartment;
          localStorage.setItem("userApartment", apartment);
        }

        if (!apartment) return;

        const usersRes = await axios.get(
          `http://localhost:5000/users/by-apartment/${apartment}`,
        );
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsersByApartment();
  }, []);

  const roles = Array.from(new Set(users.map((u) => u.role)));
  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((u) => u.role === selectedRole);

  const showResidentDetails = filteredUsers.some(
    (user) => user.role === "resident",
  );

  return (
    <>
      <Navbar />
      <div className="existing-users-container">
        <h2 className="page-title">👥 Existing Users</h2>

        <div className="filter-section">
          <label htmlFor="role-select">Filter by Role:</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Apartment</th>
              {showResidentDetails && <th>Flat No.</th>}
              {showResidentDetails && <th>Block</th>}
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.apartment}</td>
                {showResidentDetails && (
                  <>
                    <td>
                      {user.role === "resident" ? user.flat || "N/A" : "-"}
                    </td>
                    <td>
                      {user.role === "resident" ? user.block || "N/A" : "-"}
                    </td>
                  </>
                )}
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <p className="no-users-msg">No users found for the selected role.</p>
        )}
      </div>
    </>
  );
};

export default ExistingUsers;
