require('dotenv').config();
const pool = require('../db');

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');

    // Check if already seeded
    const { rows } = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(rows[0].count) > 0) {
      console.log('⚠️  Database already has products. Skipping seed.');
      return;
    }

    // Fetch all products from DummyJSON (real product images)
    console.log('📦 Fetching products from DummyJSON API...');
    const res = await fetch('https://dummyjson.com/products?limit=200&select=id,title,description,price,discountPercentage,rating,stock,brand,category,thumbnail,images,sku,weight,shippingInformation,returnPolicy,warrantyInformation');
    const data = await res.json();
    const products = data.products;

    // Collect unique categories
    const categoryMap = {};
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    
    console.log(`📂 Creating ${uniqueCategories.length} categories...`);
    for (const cat of uniqueCategories) {
      const slug = slugify(cat);
      const { rows: catRows } = await client.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), slug]
      );
      categoryMap[cat] = catRows[0].id;
    }

    console.log(`🛒 Inserting ${products.length} products...`);
    for (const p of products) {
      const slug = slugify(p.title) + '-' + p.id;
      const mrp = parseFloat((p.price * (1 + (p.discountPercentage || 0) / 100)).toFixed(2));
      
      await client.query(
        `INSERT INTO products 
          (name, slug, description, brand, category_id, price, mrp, discount_percentage, stock, thumbnail, images, rating, sku, weight, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (slug) DO NOTHING`,
        [
          p.title,
          slug,
          p.description || '',
          p.brand || '',
          categoryMap[p.category],
          p.price,
          mrp,
          p.discountPercentage || 0,
          p.stock || 50,
          p.thumbnail,
          p.images || [p.thumbnail],
          p.rating || 4.0,
          p.sku || null,
          p.weight || null,
          true,
        ]
      );
    }

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
      ['SKM Admin', 'admin@skmcart.com', adminPassword, 'admin']
    );

    console.log('✅ Seeding complete!');
    console.log(`   📦 ${products.length} products`);
    console.log(`   📂 ${uniqueCategories.length} categories`);
    console.log(`   👤 Admin: admin@skmcart.com / admin123`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(() => process.exit(1));
