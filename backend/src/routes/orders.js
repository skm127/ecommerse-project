const express = require('express');
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/orders — User's own orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id, 'name', oi.name, 'thumbnail', oi.thumbnail,
          'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total', oi.total
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id, 'name', oi.name, 'thumbnail', oi.thumbnail,
          'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total', oi.total
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')
       GROUP BY o.id`,
      [req.params.id, req.user.id, req.user.role]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — Place an order
router.post('/', authMiddleware, async (req, res) => {
  const { items, address_id, payment_method = 'cod', coupon_code } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let subtotal = 0;
    const enriched = [];

    for (const item of items) {
      const { rows } = await client.query(
        `SELECT * FROM products WHERE id = $1 AND is_active = TRUE FOR UPDATE`,
        [item.product_id]
      );
      if (!rows.length) throw new Error(`Product ${item.product_id} not found`);
      const p = rows[0];
      if (p.stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}`);
      subtotal += p.price * item.quantity;
      enriched.push({ ...item, product: p });
    }

    let discount = 0;
    if (coupon_code === 'SKM10') discount = subtotal * 0.10;
    if (coupon_code === 'PREMIUM500' && subtotal >= 2000) discount = 500;

    const discountedSubtotal = subtotal - discount;
    const gst = discountedSubtotal * 0.18;
    const delivery = discountedSubtotal > 1000 ? 0 : 50;
    const total = discountedSubtotal + gst + delivery;

    // Create order
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, address_id, subtotal, discount, gst, delivery, total, payment_method, coupon_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, address_id || null, subtotal, discount, gst, delivery, total, payment_method, coupon_code || null]
    );
    const order = orderRows[0];

    // Create order items & reduce stock
    for (const item of enriched) {
      const { product: p } = item;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, thumbnail, quantity, unit_price, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id, p.id, p.name, p.thumbnail, item.quantity, p.price, p.price * item.quantity]
      );
      await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [item.quantity, p.id]
      );
      await client.query(
        `INSERT INTO stock_audit (product_id, action, delta, new_stock)
         VALUES ($1, $2, $3, (SELECT stock FROM products WHERE id = $1))`,
        [p.id, `Sold — Order #${order.id}`, -item.quantity]
      );
    }

    // Clear cart
    await client.query(`DELETE FROM cart WHERE user_id = $1`, [req.user.id]);

    await client.query('COMMIT');
    res.status(201).json({ ...order, message: 'Order placed successfully!' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/orders/:id/status — Admin only
router.put('/:id/status', adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
