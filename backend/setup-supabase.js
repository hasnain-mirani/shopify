const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  const client = await pool.connect();
  try {
    console.log("Connecting to Supabase...");
    
    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY, 
        title TEXT NOT NULL, 
        handle TEXT NOT NULL UNIQUE,
        description TEXT DEFAULT '', 
        specifications TEXT DEFAULT '', 
        vendor TEXT DEFAULT '', 
        product_type TEXT DEFAULT '',
        status TEXT DEFAULT 'DRAFT',
        tags TEXT DEFAULT '[]', 
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        market_price REAL,
        our_price REAL,
        cost_per_item REAL,
        barcode TEXT DEFAULT '',
        track_quantity INTEGER DEFAULT 1,
        continue_selling_when_out_of_stock INTEGER DEFAULT 0,
        requires_shipping INTEGER DEFAULT 1,
        weight REAL,
        weight_unit TEXT DEFAULT 'kg',
        seo_title TEXT DEFAULT '',
        seo_description TEXT DEFAULT '',
        description_html TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY, 
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url TEXT NOT NULL, 
        alt_text TEXT DEFAULT '', 
        width INTEGER, 
        height INTEGER, 
        position INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY, 
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        title TEXT DEFAULT 'Default Title', 
        sku TEXT DEFAULT '', 
        price REAL NOT NULL DEFAULT 0,
        compare_at_price REAL, 
        quantity INTEGER DEFAULT 0, 
        position INTEGER DEFAULT 0,
        barcode TEXT DEFAULT '', 
        weight REAL, 
        weight_unit TEXT DEFAULT 'kg',
        available_for_sale INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS product_options (
        id TEXT PRIMARY KEY, 
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name TEXT NOT NULL, 
        position INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS product_option_values (
        id TEXT PRIMARY KEY, 
        option_id TEXT NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
        value TEXT NOT NULL, 
        position INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, 
        customer_name TEXT DEFAULT '', 
        customer_email TEXT DEFAULT '',
        customer_phone TEXT DEFAULT '', 
        address TEXT DEFAULT '', 
        city TEXT DEFAULT '',
        postal_code TEXT DEFAULT '', 
        country TEXT DEFAULT 'Pakistan',
        total REAL NOT NULL DEFAULT 0, 
        subtotal REAL NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'pending', 
        financial_status TEXT DEFAULT 'pending',
        fulfillment_status TEXT DEFAULT 'unfulfilled', 
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY, 
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        variant_id TEXT NOT NULL, 
        product_title TEXT NOT NULL, 
        variant_title TEXT DEFAULT '',
        price REAL NOT NULL, 
        quantity INTEGER NOT NULL DEFAULT 1, 
        image_url TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, 
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fcm_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '',
        user_email TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        url TEXT DEFAULT '',
        target_type TEXT DEFAULT 'all',
        recipient_email TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert initial settings
    await client.query(`
      INSERT INTO settings (key, value) VALUES ('store_name', 'My Store') ON CONFLICT (key) DO NOTHING;
      -- Real admin inbox (update in Admin → Settings). Placeholder *@example.com is ignored for mail.
      INSERT INTO settings (key, value) VALUES ('store_email', '') ON CONFLICT (key) DO NOTHING;
      INSERT INTO settings (key, value) VALUES ('currency', 'PKR') ON CONFLICT (key) DO NOTHING;
      INSERT INTO settings (key, value) VALUES ('whatsapp_number', '03066888139') ON CONFLICT (key) DO NOTHING;
    `);

    console.log("Supabase tables created successfully!");
  } catch (err) {
    console.error("Error setting up Supabase:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
