const db = require("../config/db");

// GET /api/reports/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
exports.summary = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "start and end are required" });
    }

    // inclusive dates: start 00:00:00 -> end 23:59:59
    const startDT = `${start} 00:00:00`;
    const endDT = `${end} 23:59:59`;

    // 1) sales in range
    const [sales] = await db.query(
      `
      SELECT 
        s.id, s.sale_no AS saleNo, s.created_at AS createdAt,
        s.total, s.paid, s.balance, s.change_amount AS \`change\`,
        s.subtotal, s.discount, s.tax_rate AS taxRate, s.tax_amount AS taxAmount,
        s.payment_method AS paymentMethod, s.status
      FROM sales s
      WHERE s.is_active = 1
        AND s.created_at BETWEEN ? AND ?
      ORDER BY s.created_at DESC
      `,
      [startDT, endDT],
    );

    // 2) items for those sales
    const ids = sales.map((x) => x.id);
    let itemsBySaleId = {};
    if (ids.length) {
      const [items] = await db.query(
        `
        SELECT 
          si.sale_id AS saleId, si.medicine_id AS medicineId, si.qty,
          si.unit_price AS unitPrice, si.line_total AS lineTotal,
          m.brand_name AS brandName, m.strength
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

    const salesWithItems = sales.map((s) => ({
      ...s,
      items: itemsBySaleId[s.id] || [],
    }));

    // 3) medicines snapshot
    const [medicines] = await db.query(
      `
      SELECT 
        id,
        brand_name AS brandName,
        generic_name AS genericName,
        form,
        strength,
        quantity,
        sell_price AS sellPrice,
        expiry_date AS expiryDate,
        is_active AS isActive
      FROM medicines
      WHERE is_active = 1
      ORDER BY brand_name ASC
      `,
    );

    res.json({
      range: { start, end },
      sales: salesWithItems,
      medicines,
    });
  } catch (err) {
    console.error("reports.summary", err);
    res.status(500).json({ message: "Server error" });
  }
};
