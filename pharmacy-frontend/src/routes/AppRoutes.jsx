import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import AppLayout from "../components/layout/AppLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Dashboard from "../pages/Dashboard";
import Medicines from "../pages/Medicines";

import Sales from "../pages/Sales";

import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

import RequireAuth from "../components/RequireAuth";
import RequireAdmin from "../components/RequireAdmin";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected App */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />

          <Route path="/sales" element={<Sales />} />

          {/* Admin-only */}
          <Route
            path="/reports"
            element={
              <RequireAdmin>
                <Reports />
              </RequireAdmin>
            }
          />

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
