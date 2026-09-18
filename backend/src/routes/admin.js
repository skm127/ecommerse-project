const express = require('express');
const pool = require('../db');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [products, orders, revenue, todayOrders, todayRevenue, lowStock, bills, users] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM products WHERE is_active = TRUE`),
      pool.query(`SELECT COUNT(*) FROM orders`),
      pool.query(`SELECT COALESCE(SUM(total), 0) as total FROM orders`),
      pool.query(`SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE`),
      pool.query(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE created_at::date = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM products WHERE stock < 5 AND is_active = TRUE`),
      pool.query(`SELECT COUNT(*) FROM bills`),
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`),
    ]);
    const inventoryValue = await pool.query(`SELECT COALESCE(SUM(price * stock), 0) as total FROM products WHERE is_active = TRUE`);

    res.json({
      totalProducts: parseInt(products.rows[0].count),
      totalOrders: parseInt(orders.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      todayOrders: parseInt(todayOrders.rows[0].count),
      todayRevenue: parseFloat(todayRevenue.rows[0].total),
      lowStockProducts: parseInt(lowStock.rows[0].count),
      totalBills: parseInt(bills.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      inventoryValue: parseFloat(inventoryValue.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders — All orders
router.get('/orders', adminMiddleware, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = '';
    const params = [];
    if (status) { where = `WHERE o.status = $1`; params.push(status); }
    const { rows } = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ${where} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/bills
router.get('/bills', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, json_agg(json_build_object(
        'id', bi.id, 'name', bi.name, 'quantity', bi.quantity,
        'unit_price', bi.unit_price, 'total', bi.total
      )) as items
       FROM bills b LEFT JOIN bill_items bi ON bi.bill_id = b.id
       GROUP BY b.id ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/bills — Create POS bill
router.post('/bills', adminMiddleware, async (req, res) => {
  const { customer_name, phone, items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let subtotal = 0;
    for (const item of items) subtotal += item.unit_price * item.quantity;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    const billId = `BILL-${Date.now().toString(36).toUpperCase()}`;
    await client.query(
      `INSERT INTO bills (id, customer_name, phone, subtotal, gst, total) VALUES ($1,$2,$3,$4,$5,$6)`,
      [billId, customer_name || 'Walk-in Customer', phone || 'N/A', subtotal, gst, total]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO bill_items (bill_id, product_id, name, quantity, unit_price, total) VALUES ($1,$2,$3,$4,$5,$6)`,
        [billId, item.product_id, item.name, item.quantity, item.unit_price, item.unit_price * item.quantity]
      );
      // Reduce stock
      await client.query(
        `UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = NOW() WHERE id = $2`,
        [item.quantity, item.product_id]
      );
      await client.query(
        `INSERT INTO stock_audit (product_id, action, delta, new_stock)
         VALUES ($1, $2, $3, (SELECT stock FROM products WHERE id = $1))`,
        [item.product_id, `Sold — Bill ${billId}`, -item.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: billId, customer_name, phone, subtotal, gst, total, items });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
