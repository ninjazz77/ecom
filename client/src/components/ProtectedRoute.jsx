import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute Component
 * Protects routes that require authentication and/or specific roles
 * 
 * @param {Array} allowedRoles - Array of roles allowed to access this route (e.g., ['admin'])
 * @param {string} redirectTo - Path to redirect if access is denied (default: '/login')
 */
const ProtectedRoute = ({ allowedRoles = [], redirectTo = "/login" }) => {
  const { user } = useSelector((store) => store.user);
  const token = localStorage.getItem("token");

  // Check if user is authenticated
  if (!user || !token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have required role
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if specified)
  return <Outlet />;
};

export default ProtectedRoute;
