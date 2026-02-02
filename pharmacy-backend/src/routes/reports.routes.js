const express = require("express");
const router = express.Router();

const reports = require("../controllers/reports.controller");
const { protect, requireRole } = require("../middleware/auth");

// Admin only
router.use(protect, requireRole("admin"));

// GET /api/reports/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/summary", reports.summary);

module.exports = router;
