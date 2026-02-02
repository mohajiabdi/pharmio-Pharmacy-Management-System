const db = require("../config/db");

// GET /api/suppliers
exports.list = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM suppliers WHERE is_active=1 ORDER BY name ASC",
    );
    res.json(rows);
  } catch (err) {
    console.error("suppliers.list", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/suppliers
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Name required" });

    const [result] = await db.query(
      "INSERT INTO suppliers (name, is_active) VALUES (?, 1)",
      [name.trim()],
    );

    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (err) {
    console.error("suppliers.create", err);
    res.status(500).json({ message: "Server error" });
  }
};
