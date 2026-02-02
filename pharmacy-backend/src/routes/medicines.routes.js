const router = require("express").Router();
const medicines = require("../controllers/medicines.controller");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", medicines.list);
router.post("/", medicines.create);
router.put("/:id", medicines.update);
router.delete("/:id", medicines.remove);
router.patch("/:id/restock", medicines.restock);

module.exports = router;
