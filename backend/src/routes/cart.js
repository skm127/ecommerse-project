const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.thumbnail, p.stock
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1 AND p.is_active = TRUE`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart — Add item
router.post('/', authMiddleware, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/:id — Update quantity
router.put('/:id', authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    // If quantity is 0 or less, remove item
    await pool.query(`DELETE FROM cart WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    return res.json({ message: 'Item removed' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, req.params.id, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/:id — Remove item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(`DELETE FROM cart WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart — Clear all
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await pool.query(`DELETE FROM cart WHERE user_id = $1`, [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
