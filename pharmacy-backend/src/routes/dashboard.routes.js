const router = require("express").Router();
const dashboard = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth");

router.get("/summary", protect, dashboard.summary);

module.exports = router;
