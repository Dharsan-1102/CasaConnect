import React from "react";
import { Navigate } from "react-router-dom";

const RequireRole = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem("userRole");
  return userRole === allowedRole ? children : <Navigate to="/" replace />;
};

export default RequireRole;
