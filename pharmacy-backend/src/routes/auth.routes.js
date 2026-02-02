const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");

router.post("/login", ctrl.login);
router.post("/signup", ctrl.signup);

module.exports = router;
