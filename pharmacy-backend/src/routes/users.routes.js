const router = require("express").Router();

const {
  getUsers,
  getMe,
  updateMyProfile,
  updateMyEmail,
  updateMyPassword,
  updateMyPreferences,
  adminUpdateUser,
  adminSetActive,
} = require("../controllers/users.controller");

const { protect } = require("../middleware/auth");

// simple admin guard
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
}

// ------------------- ME -------------------
router.get("/me", protect, getMe);
router.patch("/me/profile", protect, updateMyProfile);
router.patch("/me/email", protect, updateMyEmail);
router.patch("/me/password", protect, updateMyPassword);
router.patch("/me/preferences", protect, updateMyPreferences);

// ------------------- ADMIN -------------------
router.get("/", protect, requireAdmin, getUsers);
router.patch("/:id", protect, requireAdmin, adminUpdateUser);
router.patch("/:id/active", protect, requireAdmin, adminSetActive);

module.exports = router;
