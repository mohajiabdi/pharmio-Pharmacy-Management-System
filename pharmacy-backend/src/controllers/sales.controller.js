const db = require("../config/db");

const TAX_RATE_FIXED = 5; // ✅ fixed by rules

function toNum(n, fallback = 0) {
  const x = Number(n);
  return Number.isNaN(x) ? fallback : x;
}
function clampMoney(n) {
  const x = toNum(n, 0);
  return x < 0 ? 0 : x;
}
function clampInt(n, fallback = 0) {
  const x = Math.floor(toNum(n, fallback));
  return x < 0 ? 0 : x;
}

// ORD-YYYYMMDD-0001
async function generateSaleNo(conn) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM sales WHERE DATE(created_at) = CURDATE()`,
  );
  const count = Number(rows?.[0]?.c || 0) + 1;

  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `ORD-${y}${m}${day}-${String(count).padStart(4, "0")}`;
}

/**
 * POST /api/sales
 * body:
 * {
 *   paymentMethod: "cash"|"card"|"mobile",
 *   discount?: number,
 *   paid?: number,
 *   items: [{ medicineId: number, qty: number }]
 * }
 */
exports.create = async (req, res) => {
  const userId = req.user?.id;

  const {
    paymentMethod = "cash",
    discount = 0,
    paid = 0,
    items = [],
  } = req.body || {};

  if (!userId) return res.status(401).json({ message: "Not authorized" });

  if (!["cash", "card", "mobile"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid paymentMethod" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items is required" });
  }

  // validate items quickly
  for (const it of items) {
    const medicineId = clampInt(it?.medicineId, 0);
    const qty = clampInt(it?.qty, 0);
    if (!medicineId || qty <= 0) {
      return res.status(400).json({ message: "Invalid items payload" });
    }
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1) Lock medicine rows and validate stock/expiry
    const ids = [...new Set(items.map((i) => Number(i.medicineId)))];
    const placeholders = ids.map(() => "?").join(",");

    const [medRows] = await conn.query(
      `
      SELECT 
        id,
        brand_name,
        strength,
        quantity,
        sell_price,
        expiry_date,
        is_active
      FROM medicines
      WHERE id IN (${placeholders})
      FOR UPDATE
      `,
      ids,
    );

    const medMap = new Map(medRows.map((m) => [Number(m.id), m]));

    // check each requested item
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const it of items) {
      const medicineId = Number(it.medicineId);
      const qtyWant = clampInt(it.qty, 0);

      const med = medMap.get(medicineId);
      if (!med || Number(med.is_active) !== 1) {
        await conn.rollback();
        return res
          .status(400)
          .json({ message: `Medicine not found: ${medicineId}` });
      }

      // expiry check: exp < today => blocked
      const exp = new Date(med.expiry_date);
      exp.setHours(0, 0, 0, 0);
      if (exp < today) {
        await conn.rollback();
        return res.status(400).json({
          message: `Cannot sell expired medicine: ${med.brand_name} ${med.strength}`,
        });
      }

      const available = clampInt(med.quantity, 0);
      if (qtyWant > available) {
        await conn.rollback();
        return res.status(400).json({
          message: `Not enough stock for ${med.brand_name} ${med.strength}. Available: ${available}`,
        });
      }
    }

    // 2) Compute totals from DB prices
    let subtotal = 0;

    const normalizedItems = items.map((it) => {
      const med = medMap.get(Number(it.medicineId));
      const qty = clampInt(it.qty, 0);
      const unitPrice = clampMoney(med.sell_price);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      return {
        medicineId: Number(it.medicineId),
        qty,
        unitPrice,
        lineTotal,
        name: `${med.brand_name} • ${med.strength}`,
      };
    });

    // ✅ rules
    const discountVal = clampMoney(discount);
    const paidVal = clampMoney(paid);

    const discountMax = subtotal * 0.1; // ✅ max 10%
    const discountClamped =
      discountVal > discountMax ? discountMax : discountVal;

    const taxRateVal = TAX_RATE_FIXED; // ✅ ignore frontend
    const taxAmount = (subtotal - discountClamped) * (taxRateVal / 100);

    const total = subtotal - discountClamped + taxAmount;

    const balance = paidVal >= total ? 0 : total - paidVal;
    const changeAmount = paidVal > total ? paidVal - total : 0;
    const status = balance <= 0 ? "Paid" : "Pending";

    // 3) Insert sales row (walk-in only => customer_name NULL)
    const saleNo = await generateSaleNo(conn);

    const [saleResult] = await conn.query(
      `
      INSERT INTO sales
      (sale_no, customer_name, payment_method, status,
       subtotal, discount, tax_rate, tax_amount, total, paid, balance, change_amount,
       created_by, is_active)
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        saleNo,
        paymentMethod,
        status,
        subtotal,
        discountClamped,
        taxRateVal,
        taxAmount,
        total,
        paidVal,
        balance,
        changeAmount,
        userId,
      ],
    );

    const saleId = saleResult.insertId;

    // 4) Insert sale_items
    const saleItemsValues = normalizedItems.map((it) => [
      saleId,
      it.medicineId,
      it.qty,
      it.unitPrice,
      it.lineTotal,
    ]);

    await conn.query(
      `
      INSERT INTO sale_items
      (sale_id, medicine_id, qty, unit_price, line_total)
      VALUES ?
      `,
      [saleItemsValues],
    );

    // 5) Update stock
    for (const it of normalizedItems) {
      await conn.query(
        `UPDATE medicines
         SET quantity = quantity - ?
         WHERE id = ? AND is_active = 1`,
        [it.qty, it.medicineId],
      );
    }

    await conn.commit();

    return res.status(201).json({
      id: saleId,
      saleNo,
      status,
      paymentMethod,
      subtotal,
      discount: Number(discountClamped.toFixed(2)),
      taxRate: taxRateVal,
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      paid: Number(paidVal.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      change: Number(changeAmount.toFixed(2)),
      items: normalizedItems.map((x) => ({
        medicineId: x.medicineId,
        name: x.name,
        qty: x.qty,
        unitPrice: Number(x.unitPrice.toFixed(2)),
        lineTotal: Number(x.lineTotal.toFixed(2)),
      })),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }
    console.error("sales.create", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};
// GET /api/sales/recent?days=7
exports.recent = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(30, Number(req.query.days) || 7));

    // NOTE: use your real column names here:
    // In your insert you used: created_by, created_at, sale_no, change_amount, tax_rate, tax_amount
    const [sales] = await db.query(
      `
      SELECT
        s.id,
        s.sale_no   AS saleNo,
        s.created_at AS createdAt,
        s.total,
        s.paid,
        s.balance,
        s.change_amount AS \`change\`,
        s.payment_method AS paymentMethod,
        s.status,
        s.subtotal,
        s.discount,
        s.tax_rate AS taxRate,
        s.tax_amount AS taxAmount
      FROM sales s
      WHERE s.is_active = 1
        AND s.created_at >= (NOW() - INTERVAL ? DAY)
      ORDER BY s.created_at DESC
      `,
      [days],
    );

    const ids = sales.map((x) => x.id);
    let itemsBySaleId = {};

    if (ids.length) {
      const [items] = await db.query(
        `
        SELECT
          si.sale_id AS saleId,
          si.medicine_id AS medicineId,
          si.qty,
          si.unit_price AS unitPrice,
          si.line_total AS lineTotal,
          m.brand_name AS brandName,
          m.strength
        FROM sale_items si
        JOIN medicines m ON m.id = si.medicine_id
        WHERE si.sale_id IN (?)
        ORDER BY si.id ASC
        `,
        [ids],
      );

      itemsBySaleId = items.reduce((acc, it) => {
        (acc[it.saleId] ||= []).push({
          medicineId: it.medicineId,
          qty: it.qty,
          unitPrice: Number(it.unitPrice),
          lineTotal: Number(it.lineTotal),
          name: `${it.brandName} • ${it.strength}`,
        });
        return acc;
      }, {});
    }

    const data = sales.map((s) => ({
      ...s,
      items: itemsBySaleId[s.id] || [],
    }));

    return res.json(data);
  } catch (err) {
    console.error("sales.recent", err);
    return res.status(500).json({ message: "Server error" });
  }
};
