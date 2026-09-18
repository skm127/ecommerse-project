require('dotenv').config();
const pool = require('../db');

const createTables = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Running migrations...');

    await client.query(`
      -- Users
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        phone       TEXT,
        role        TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        created_at  TIMESTAMP DEFAULT NOW()
      );

      -- Categories
      CREATE TABLE IF NOT EXISTS categories (
        id        SERIAL PRIMARY KEY,
        name      TEXT NOT NULL,
        slug      TEXT UNIQUE NOT NULL,
        image_url TEXT
      );

      -- Products
      CREATE TABLE IF NOT EXISTS products (
        id                  SERIAL PRIMARY KEY,
        name                TEXT NOT NULL,
        slug                TEXT UNIQUE,
        description         TEXT,
        brand               TEXT,
        category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        price               DECIMAL(10,2) NOT NULL,
        mrp                 DECIMAL(10,2),
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        stock               INTEGER NOT NULL DEFAULT 0,
        thumbnail           TEXT,
        images              TEXT[] DEFAULT '{}',
        rating              DECIMAL(3,2) DEFAULT 0,
        sku                 TEXT,
        weight              DECIMAL(10,2),
        is_active           BOOLEAN DEFAULT TRUE,
        created_at          TIMESTAMP DEFAULT NOW(),
        updated_at          TIMESTAMP DEFAULT NOW()
      );

      -- Addresses
      CREATE TABLE IF NOT EXISTS addresses (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        street     TEXT NOT NULL,
        city       TEXT NOT NULL,
        state      TEXT NOT NULL,
        pincode    TEXT NOT NULL,
        phone      TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Cart
      CREATE TABLE IF NOT EXISTS cart (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity   INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );

      -- Orders
      CREATE TABLE IF NOT EXISTS orders (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
        address_id   INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
        status       TEXT DEFAULT 'placed' CHECK (status IN ('placed','confirmed','processing','shipped','delivered','cancelled')),
        subtotal     DECIMAL(10,2) NOT NULL,
        discount     DECIMAL(10,2) DEFAULT 0,
        gst          DECIMAL(10,2) NOT NULL,
        delivery     DECIMAL(10,2) DEFAULT 0,
        total        DECIMAL(10,2) NOT NULL,
        payment_method TEXT DEFAULT 'cod',
        coupon_code  TEXT,
        notes        TEXT,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      );

      -- Order Items
      CREATE TABLE IF NOT EXISTS order_items (
        id         SERIAL PRIMARY KEY,
        order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        name       TEXT NOT NULL,
        thumbnail  TEXT,
        quantity   INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total      DECIMAL(10,2) NOT NULL
      );

      -- Stock Audit
      CREATE TABLE IF NOT EXISTS stock_audit (
        id         SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        action     TEXT NOT NULL,
        delta      INTEGER NOT NULL,
        new_stock  INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Admin Bills (for retail/POS billing)
      CREATE TABLE IF NOT EXISTS bills (
        id            TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone         TEXT,
        subtotal      DECIMAL(10,2) NOT NULL,
        gst           DECIMAL(10,2) NOT NULL,
        total         DECIMAL(10,2) NOT NULL,
        created_at    TIMESTAMP DEFAULT NOW()
      );

      -- Bill Items
      CREATE TABLE IF NOT EXISTS bill_items (
        id         SERIAL PRIMARY KEY,
        bill_id    TEXT REFERENCES bills(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        name       TEXT NOT NULL,
        quantity   INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total      DECIMAL(10,2) NOT NULL
      );

      -- Full text search index on products
      CREATE INDEX IF NOT EXISTS products_search_idx ON products
        USING gin(to_tsvector('english', name || ' ' || COALESCE(description,'') || ' ' || COALESCE(brand,'')));
    `);

    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch(() => process.exit(1));
