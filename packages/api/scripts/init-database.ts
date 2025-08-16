#!/usr/bin/env tsx

/**
 * Initialize database with core entity tables only
 */

import { DbClient } from "@video-rental/db";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path where to store the database
const dbPath = resolve(__dirname, "../database/video-rental.db");

console.log("🗄️  Initializing video rental database...");
console.log(`📁 Database path: ${dbPath}`);

// Core entity schema - simplified from TypeSpec models for actual database usage
const coreSchema = `
-- SQLite performance and reliability pragmas
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456;
PRAGMA page_size = 4096;
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA busy_timeout = 5000;

-- Core business entity tables
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  discount_percentage REAL DEFAULT 0.0,
  member_since TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  genre TEXT NOT NULL,
  rating TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT,
  director TEXT,
  rental_price REAL NOT NULL DEFAULT 3.99,
  available_copies INTEGER NOT NULL DEFAULT 0,
  total_copies INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  copy_id TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Good',
  status TEXT NOT NULL DEFAULT 'Available',
  date_acquired TEXT NOT NULL,
  last_rented_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (video_id) REFERENCES videos(id)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS rentals (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  inventory_id TEXT NOT NULL,
  rental_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  rental_fee_amount REAL NOT NULL,
  rental_fee_currency TEXT NOT NULL DEFAULT 'USD',
  late_fee_amount REAL DEFAULT 0.0,
  late_fee_currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (video_id) REFERENCES videos(id),
  FOREIGN KEY (inventory_id) REFERENCES inventory(id)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  rental_id TEXT,
  amount_value REAL NOT NULL,
  amount_currency TEXT NOT NULL DEFAULT 'USD',
  payment_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (rental_id) REFERENCES rentals(id)
) WITHOUT ROWID;

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_member_since ON customers(member_since);

CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);
CREATE INDEX IF NOT EXISTS idx_videos_genre ON videos(genre);
CREATE INDEX IF NOT EXISTS idx_videos_rating ON videos(rating);
CREATE INDEX IF NOT EXISTS idx_videos_rental_price ON videos(rental_price);

CREATE INDEX IF NOT EXISTS idx_inventory_video_id ON inventory(video_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_condition ON inventory(condition);

CREATE INDEX IF NOT EXISTS idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_video_id ON rentals(video_id);
CREATE INDEX IF NOT EXISTS idx_rentals_inventory_id ON rentals(inventory_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_due_date ON rentals(due_date);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_date ON rentals(rental_date);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
`;

try {
  const db = new DbClient(dbPath);

  console.log("📋 Executing schema...");

  // Execute schema in smaller chunks to avoid potential issues
  const statements = coreSchema.split(";").filter((stmt) => stmt.trim());

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (stmt) {
      console.log(`📋 Executing statement ${i + 1}/${statements.length}`);
      db.exec(stmt + ";");
    }
  }

  console.log("✅ Database initialized successfully!");
  console.log("📊 Core tables created:");
  console.log("  - customers");
  console.log("  - videos");
  console.log("  - inventory");
  console.log("  - rentals");
  console.log("  - payments");

  // Verify tables were created
  const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const tables = db.all(stmt);
  console.log("🔍 Verified tables:", tables.map((t: any) => t.name).join(", "));

  db.close();
} catch (error) {
  console.error("❌ Failed to initialize database:", error);
  process.exit(1);
}
