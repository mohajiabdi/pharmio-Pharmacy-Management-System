import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import AppLayout from "../components/layout/AppLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Dashboard from "../pages/Dashboard";
import Medicines from "../pages/Medicines";
import Customers from "../pages/Customers";
import Sales from "../pages/Sales";
import Suppliers from "../pages/Suppliers";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ redirect root */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* ✅ Public (NO sidebar) */}
        <Route element={<PublicLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* ✅ App (WITH sidebar) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
