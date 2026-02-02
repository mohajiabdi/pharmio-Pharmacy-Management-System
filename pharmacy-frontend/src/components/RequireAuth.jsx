// components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function hasToken() {
  const token = localStorage.getItem("pharmly_token");
  return !!token;
}

export default function RequireAuth({ children }) {
  const loc = useLocation();

  if (!hasToken()) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return children;
}
