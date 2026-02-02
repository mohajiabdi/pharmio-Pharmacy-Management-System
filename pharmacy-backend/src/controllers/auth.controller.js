const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const [rows] = await pool.query(
      "SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email=? LIMIT 1",

      [email],
    );

    if (!rows.length) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account disabled" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// pool + jwt already there

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // check if email exists
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [email],
    );
    if (exists.length) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    // always create as pharmacist (NO admin from signup)
    const role = "pharmacist";

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)",
      [fullName, email, hash, role],
    );

    return res.status(201).json({
      success: true,
      message: "Account created",
      user: {
        id: result.insertId,
        full_name: fullName,
        email,
        role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
