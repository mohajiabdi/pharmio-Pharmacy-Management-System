const db = require("../config/db");

exports.summary = async (req, res) => {
  // default last 7 days
  const days = Math.max(1, Math.min(30, Number(req.query.days || 7)));

  const conn = await db.getConnection();
  try {
    // 1) KPI: orders, revenue
    const [salesRows] = await conn.query(
      `
      SELECT 
        COUNT(*) AS orders,
        COALESCE(SUM(total),0) AS revenue
      FROM sales
      WHERE is_active=1
        AND created_at >= (NOW() - INTERVAL ? DAY)
      `,
      [days],
    );

    // 2) Profit: sum((sell - buy) * qty)
    const [profitRows] = await conn.query(
      `
      SELECT 
        COALESCE(SUM((si.unit_price - COALESCE(m.buy_price,0)) * si.qty),0) AS profit,
        COALESCE(SUM(COALESCE(m.buy_price,0) * si.qty),0) AS cost
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      JOIN medicines m ON m.id = si.medicine_id
      WHERE s.is_active=1
        AND s.created_at >= (NOW() - INTERVAL ? DAY)
      `,
      [days],
    );

    // 3) Daily revenue bars
    const [dailyRows] = await conn.query(
      `
      SELECT DATE(created_at) AS d, COALESCE(SUM(total),0) AS revenue
      FROM sales
      WHERE is_active=1
        AND created_at >= (CURDATE() - INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY d ASC
      `,
      [days - 1],
    );

    // 4) Heatmap: orders per day-of-week (Mon..Sun) x hour (0..23)
    // return 7 x 24 grid as array of arrays
    const [heatRows] = await conn.query(
      `
      SELECT 
        WEEKDAY(created_at) AS wd,  -- 0=Mon .. 6=Sun
        HOUR(created_at) AS hh,
        COUNT(*) AS c
      FROM sales
      WHERE is_active=1
        AND created_at >= (NOW() - INTERVAL ? DAY)
      GROUP BY wd, hh
      `,
      [days],
    );

    const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
    heatRows.forEach((r) => {
      heat[r.wd][r.hh] = Number(r.c || 0);
    });

    // 5) Inventory status
    const [invRows] = await conn.query(
      `
      SELECT
        SUM(CASE WHEN quantity > 10 THEN 1 ELSE 0 END) AS inStock,
        SUM(CASE WHEN quantity BETWEEN 1 AND 10 THEN 1 ELSE 0 END) AS low,
        SUM(CASE WHEN quantity <= 0 THEN 1 ELSE 0 END) AS outOfStock,
        SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN expiry_date >= CURDATE() AND expiry_date <= (CURDATE() + INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS expSoon,
        COUNT(*) AS total
      FROM medicines
      WHERE is_active=1
      `,
    );

    // 6) Recent orders (for “Recent Orders” panel)
    const [recentSales] = await conn.query(
      `
      SELECT id, sale_no, status, total, created_at
      FROM sales
      WHERE is_active=1
      ORDER BY created_at DESC
      LIMIT 6
      `,
    );

    // Items summary for each order (short)
    const saleIds = recentSales.map((x) => x.id);
    let itemsMap = new Map();
    if (saleIds.length) {
      const [items] = await conn.query(
        `
        SELECT si.sale_id, m.brand_name, m.strength, si.qty
        FROM sale_items si
        JOIN medicines m ON m.id = si.medicine_id
        WHERE si.sale_id IN (?)
        ORDER BY si.sale_id DESC
        `,
        [saleIds],
      );

      items.forEach((it) => {
        const key = it.sale_id;
        const arr = itemsMap.get(key) || [];
        arr.push(`${it.brand_name} ${it.strength} (${it.qty})`);
        itemsMap.set(key, arr);
      });
    }

    const recent = recentSales.map((s) => ({
      id: s.id,
      saleNo: s.sale_no,
      status: s.status,
      total: Number(s.total || 0),
      createdAt: s.created_at,
      itemsText: (itemsMap.get(s.id) || []).slice(0, 2).join(", "),
    }));

    return res.json({
      days,
      kpis: {
        orders: Number(salesRows?.[0]?.orders || 0),
        revenue: Number(salesRows?.[0]?.revenue || 0),
        profit: Number(profitRows?.[0]?.profit || 0),
        cost: Number(profitRows?.[0]?.cost || 0),
      },
      dailyRevenue: dailyRows.map((r) => ({
        date: String(r.d),
        revenue: Number(r.revenue || 0),
      })),
      heatmap: heat, // 7 x 24
      inventory: invRows?.[0] || {},
      recent,
    });
  } catch (e) {
    console.error("dashboard.summary", e);
    return res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};
