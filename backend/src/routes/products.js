const express = require('express');
const pool = require('../db');
const { upload } = require('../cloudinary');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/products — with search, filter, sort, pagination
router.get('/', async (req, res) => {
  const { search, category, sort = 'created_at', order = 'desc', page = 1, limit = 30 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let conditions = ['p.is_active = TRUE'];
    const params = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`to_tsvector('english', p.name || ' ' || COALESCE(p.description,'') || ' ' || COALESCE(p.brand,'')) @@ plainto_tsquery('english', $${paramIdx})`);
      params.push(search);
      paramIdx++;
    }
    if (category) {
      conditions.push(`c.slug = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    const sortColumn = { price: 'p.price', rating: 'p.rating', name: 'p.name', created_at: 'p.created_at' }[sort] || 'p.created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      products: rows,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = TRUE`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    const product = rows[0];

    // Related products
    const { rows: related } = await pool.query(
      `SELECT id, name, price, thumbnail, rating FROM products
       WHERE category_id = $1 AND id != $2 AND is_active = TRUE
       ORDER BY rating DESC LIMIT 4`,
      [product.category_id, product.id]
    );
    product.related = related;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — Admin only, with image upload
router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, brand, category_id, price, mrp, stock, sku, weight } = req.body;
  if (!name || !price || !stock || !category_id)
    return res.status(400).json({ error: 'name, price, stock and category_id are required' });

  try {
    const thumbnail = req.file ? req.file.path : (req.body.thumbnail || null);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, description, brand, category_id, price, mrp, stock, thumbnail, images, sku, weight)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [name, slug, description || '', brand || '', category_id, price, mrp || price, stock, thumbnail, thumbnail ? [thumbnail] : [], sku || null, weight || null]
    );

    // Stock audit
    await pool.query(
      `INSERT INTO stock_audit (product_id, action, delta, new_stock) VALUES ($1, $2, $3, $4)`,
      [rows[0].id, 'Initial Stock', parseInt(stock), parseInt(stock)]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — Admin only
router.put('/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, brand, category_id, price, mrp, sku, weight, is_active } = req.body;
  try {
    const thumbnail = req.file ? req.file.path : req.body.thumbnail;
    const updateFields = [];
    const params = [];
    let idx = 1;

    const addField = (col, val) => { if (val !== undefined) { updateFields.push(`${col} = $${idx++}`); params.push(val); } };
    addField('name', name);
    addField('description', description);
    addField('brand', brand);
    addField('category_id', category_id);
    addField('price', price);
    addField('mrp', mrp);
    addField('sku', sku);
    addField('weight', weight);
    addField('is_active', is_active);
    if (thumbnail) { addField('thumbnail', thumbnail); addField('images', [thumbnail]); }
    updateFields.push(`updated_at = NOW()`);

    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/stock — Admin only
router.patch('/:id/stock', adminMiddleware, async (req, res) => {
  const { delta, reason } = req.body;
  if (delta === undefined) return res.status(400).json({ error: 'delta is required' });
  try {
    const { rows } = await pool.query(
      `UPDATE products SET stock = GREATEST(0, stock + $1), updated_at = NOW()
       WHERE id = $2 RETURNING id, name, stock`,
      [parseInt(delta), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    await pool.query(
      `INSERT INTO stock_audit (product_id, action, delta, new_stock) VALUES ($1, $2, $3, $4)`,
      [rows[0].id, reason || 'Manual Adjustment', parseInt(delta), rows[0].stock]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — Admin only (soft delete)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await pool.query(`UPDATE products SET is_active = FALSE WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
