const express = require("express");
const router = express.Router();

const salesController = require("../controllers/sales.controller");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", salesController.create);
router.get("/recent", salesController.recent);

module.exports = router;
