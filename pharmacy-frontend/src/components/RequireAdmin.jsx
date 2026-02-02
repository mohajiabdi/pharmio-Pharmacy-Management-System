// components/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function getRoleFromToken() {
  const token = localStorage.getItem("pharmly_token");
  if (!token) return null;

  try {
    const base64 = token.split(".")[1];
    const payload = JSON.parse(atob(base64));
    return payload?.role || null;
  } catch {
    return null;
  }
}

export default function RequireAdmin({ children }) {
  const loc = useLocation();
  const role = getRoleFromToken();

  if (!role) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (role !== "admin") {
    <Navigate to="/dashboard" replace />;
  }

  return children;
}
