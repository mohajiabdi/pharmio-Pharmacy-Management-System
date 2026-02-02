const router = require("express").Router();
const suppliers = require("../controllers/suppliers.controller");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", suppliers.list);
router.post("/", suppliers.create);

module.exports = router;
