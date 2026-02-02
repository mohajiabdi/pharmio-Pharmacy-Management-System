const express = require("express");
const cors = require("cors");

const suppliersRoutes = require("./routes/suppliers.routes");
const medicinesRoutes = require("./routes/medicines.routes");
const salesRoutes = require("./routes/sales.routes");
const reportsRoutes = require("./routes/reports.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const { protect, requireRole } = require("./middleware/auth");

const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.get("/", (req, res) => res.json({ ok: true, name: "Pharmacy API" }));
app.use("/api/auth", authRoutes);

const usersRoutes = require("./routes/users.routes");
app.use("/api/users", usersRoutes);

// ✅ protected modules
app.use("/api/suppliers", protect, suppliersRoutes);
app.use("/api/medicines", protect, medicinesRoutes);
app.use("/api/sales", protect, salesRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);

// ✅ admin-only
app.use("/api/reports", protect, requireRole("admin"), reportsRoutes);

app.use((err, req, res, next) => {
  console.error("🔥 API Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;
