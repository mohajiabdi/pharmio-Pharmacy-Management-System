const db = require("../config/db");

/**
 * Helpers
 */
const toYMD = (d) => {
  if (!d) return null;
  // expects 'YYYY-MM-DD' from frontend
  return String(d).slice(0, 10);
};

// GET /api/medicines
exports.list = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.brand_name   AS brandName,
        m.generic_name AS genericName,
        m.form,
        m.category,
        m.strength,
        m.supplier_id  AS supplierId,
        s.name         AS supplierName,
        m.quantity,
        m.buy_price    AS buyPrice,
        m.sell_price   AS sellPrice,
        DATE_FORMAT(m.expiry_date, '%Y-%m-%d') AS expiryDate
      FROM medicines m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      WHERE m.is_active = 1
      ORDER BY m.id DESC
    `);

    return res.json({ data: rows });
  } catch (err) {
    console.error("medicines.list", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/medicines
exports.create = async (req, res) => {
  try {
    const {
      brandName,
      genericName,
      form,
      category,
      strength,
      supplierId,
      quantity,
      buyPrice,
      sellPrice,
      expiryDate,
    } = req.body;

    if (!brandName?.trim())
      return res.status(400).json({ message: "brandName required" });
    if (!form) return res.status(400).json({ message: "form required" });
    if (!category)
      return res.status(400).json({ message: "category required" });
    if (!strength?.trim())
      return res.status(400).json({ message: "strength required" });
    if (!supplierId)
      return res.status(400).json({ message: "supplierId required" });
    if (!expiryDate)
      return res.status(400).json({ message: "expiryDate required" });

    const [result] = await db.query(
      `
      INSERT INTO medicines
        (brand_name, generic_name, form, category, strength, supplier_id,
         quantity, buy_price, sell_price, expiry_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        brandName.trim(),
        genericName?.trim() || null,
        form,
        category,
        strength.trim(),
        Number(supplierId),
        Number(quantity) || 0,
        Number(buyPrice) || 0,
        Number(sellPrice) || 0,
        toYMD(expiryDate),
      ],
    );

    return res.status(201).json({ data: { id: result.insertId } });
  } catch (err) {
    console.error("medicines.create", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/medicines/:id
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      brandName,
      genericName,
      form,
      category,
      strength,
      supplierId,
      quantity,
      buyPrice,
      sellPrice,
      expiryDate,
    } = req.body;

    if (!id) return res.status(400).json({ message: "invalid id" });

    // Basic validation (same rules as create)
    if (!brandName?.trim())
      return res.status(400).json({ message: "brandName required" });
    if (!form) return res.status(400).json({ message: "form required" });
    if (!category)
      return res.status(400).json({ message: "category required" });
    if (!strength?.trim())
      return res.status(400).json({ message: "strength required" });
    if (!supplierId)
      return res.status(400).json({ message: "supplierId required" });
    if (!expiryDate)
      return res.status(400).json({ message: "expiryDate required" });

    const [result] = await db.query(
      `
      UPDATE medicines SET
        brand_name   = ?,
        generic_name = ?,
        form         = ?,
        category     = ?,
        strength     = ?,
        supplier_id  = ?,
        quantity     = ?,
        buy_price    = ?,
        sell_price   = ?,
        expiry_date  = ?
      WHERE id = ? AND is_active = 1
      `,
      [
        brandName.trim(),
        genericName?.trim() || null,
        form,
        category,
        strength.trim(),
        Number(supplierId),
        Number(quantity) || 0,
        Number(buyPrice) || 0,
        Number(sellPrice) || 0,
        toYMD(expiryDate),
        id,
      ],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found" });

    return res.json({ ok: true });
  } catch (err) {
    console.error("medicines.update", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/medicines/:id  (soft delete)
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "invalid id" });

    const [result] = await db.query(
      `UPDATE medicines SET is_active = 0 WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found" });

    return res.json({ ok: true });
  } catch (err) {
    console.error("medicines.remove", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/medicines/:id/restock
exports.restock = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const qty = Number(req.body.quantity);

    if (!id) return res.status(400).json({ message: "invalid id" });
    if (!qty || qty <= 0)
      return res.status(400).json({ message: "quantity must be > 0" });

    const [result] = await db.query(
      `
      UPDATE medicines
      SET quantity = quantity + ?
      WHERE id = ? AND is_active = 1
      `,
      [qty, id],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found" });

    return res.json({ ok: true });
  } catch (err) {
    console.error("medicines.restock", err);
    return res.status(500).json({ message: "Server error" });
  }
};
