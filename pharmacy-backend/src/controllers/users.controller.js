const pool = require("../config/db");
const bcrypt = require("bcryptjs");

function safeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    is_active: !!row.is_active,
    created_at: row.created_at,
    theme_mode: row.theme_mode || "system",
    palette_key: row.palette_key || "indigo-sky",
  };
}

// ================= ADMIN: LIST USERS =================
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users
       ORDER BY created_at DESC`,
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows.map(safeUser),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ================= ME =================
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users WHERE id=? LIMIT 1`,
      [req.user.id],
    );

    const me = rows[0];
    if (!me)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!me.is_active)
      return res
        .status(403)
        .json({ success: false, message: "Account inactive" });

    res.json({ success: true, data: safeUser(me) });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

// ================= ME: PROFILE =================
exports.updateMyProfile = async (req, res) => {
  try {
    const full_name = String(req.body.full_name || "").trim();
    if (!full_name) {
      return res
        .status(400)
        .json({ success: false, message: "Full name is required" });
    }

    await pool.query("UPDATE users SET full_name=? WHERE id=?", [
      full_name,
      req.user.id,
    ]);

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users WHERE id=? LIMIT 1`,
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Profile updated",
      data: safeUser(rows[0]),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

// ================= ME: EMAIL =================
exports.updateMyEmail = async (req, res) => {
  try {
    const currentEmail = String(req.body.currentEmail || "")
      .trim()
      .toLowerCase();
    const newEmail = String(req.body.newEmail || "")
      .trim()
      .toLowerCase();

    if (!currentEmail || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "currentEmail and newEmail are required",
      });
    }

    const [meRows] = await pool.query(
      "SELECT id, email FROM users WHERE id=? LIMIT 1",
      [req.user.id],
    );
    const me = meRows[0];

    if (!me)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (me.email.toLowerCase() !== currentEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Current email is not correct" });
    }

    const [dupe] = await pool.query(
      "SELECT id FROM users WHERE email=? AND id<>?",
      [newEmail, req.user.id],
    );
    if (dupe.length) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    await pool.query("UPDATE users SET email=? WHERE id=?", [
      newEmail,
      req.user.id,
    ]);

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users WHERE id=? LIMIT 1`,
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Email updated",
      data: safeUser(rows[0]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update email" });
  }
};

// ================= ME: PASSWORD =================
exports.updateMyPassword = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const [rows] = await pool.query(
      "SELECT id, password_hash FROM users WHERE id=? LIMIT 1",
      [req.user.id],
    );
    const me = rows[0];

    if (!me)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, me.password_hash);
    if (!ok) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is not correct" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", [
      hash,
      req.user.id,
    ]);

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update password" });
  }
};

// ================= ME: PREFERENCES =================
exports.updateMyPreferences = async (req, res) => {
  try {
    const theme_mode = String(req.body.theme_mode || "system");
    const palette_key = String(req.body.palette_key || "indigo-sky");

    const allowedTheme = ["light", "dark", "system"];
    if (!allowedTheme.includes(theme_mode)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid theme_mode" });
    }

    await pool.query(
      "UPDATE users SET theme_mode=?, palette_key=? WHERE id=?",
      [theme_mode, palette_key, req.user.id],
    );

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users WHERE id=? LIMIT 1`,
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Preferences saved",
      data: safeUser(rows[0]),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save preferences" });
  }
};

// ================= ADMIN: UPDATE USER =================
exports.adminUpdateUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);

    if (targetId === req.user.id) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot edit yourself" });
    }

    const [rows] = await pool.query(
      "SELECT id, role FROM users WHERE id=? LIMIT 1",
      [targetId],
    );
    const target = rows[0];

    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (target.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "You cannot edit another admin" });
    }

    const full_name =
      req.body.full_name != null ? String(req.body.full_name).trim() : null;
    const email =
      req.body.email != null
        ? String(req.body.email).trim().toLowerCase()
        : null;
    const role =
      req.body.role != null ? String(req.body.role).toLowerCase() : null;

    const allowedRoles = ["admin", "pharmacist", "cashier"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot promote users to admin",
      });
    }

    if (email) {
      const [dupe] = await pool.query(
        "SELECT id FROM users WHERE email=? AND id<>?",
        [email, targetId],
      );
      if (dupe.length) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    await pool.query(
      `UPDATE users
       SET
         full_name = COALESCE(?, full_name),
         email = COALESCE(?, email),
         role = COALESCE(?, role)
       WHERE id=?`,
      [full_name, email, role, targetId],
    );

    const [after] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users WHERE id=? LIMIT 1`,
      [targetId],
    );

    res.json({
      success: true,
      message: "User updated",
      data: safeUser(after[0]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// ================= ADMIN: ACTIVE TOGGLE =================
exports.adminSetActive = async (req, res) => {
  try {
    const targetId = Number(req.params.id);

    if (targetId === req.user.id) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot deactivate yourself" });
    }

    const is_active = req.body.is_active ? 1 : 0;

    const [rows] = await pool.query("SELECT id FROM users WHERE id=? LIMIT 1", [
      targetId,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await pool.query("UPDATE users SET is_active=? WHERE id=?", [
      is_active,
      targetId,
    ]);

    const [after] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, theme_mode, palette_key
       FROM users WHERE id=? LIMIT 1`,
      [targetId],
    );

    res.json({
      success: true,
      message: "User status updated",
      data: safeUser(after[0]),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user status" });
  }
};
