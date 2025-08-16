-- SQLite performance and reliability pragmas
PRAGMA journal_mode = WAL;           -- Write-Ahead Logging for better concurrency
PRAGMA synchronous = NORMAL;         -- Balance between safety and performance
PRAGMA cache_size = -64000;          -- 64MB cache size (negative = KB)
PRAGMA foreign_keys = ON;            -- Enable foreign key constraints
PRAGMA temp_store = MEMORY;          -- Store temporary tables in memory
PRAGMA mmap_size = 268435456;        -- 256MB memory-mapped I/O
PRAGMA page_size = 4096;             -- Optimal page size for most systems
PRAGMA auto_vacuum = INCREMENTAL;    -- Prevent database bloat over time
PRAGMA busy_timeout = 5000;          -- 5 second timeout for lock conflicts

CREATE TABLE api_documentation (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  base_url TEXT NOT NULL,
  links TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE copy_condition (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE copy_status (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE customer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  discount_percentage REAL,
  member_since TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE customer_create (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  discount_percentage REAL,
  member_since TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE customer_status (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE customer_update (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  address TEXT,
  phone_number TEXT,
  discount_percentage REAL,
  member_since TEXT,
  status TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE health_response (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  service TEXT NOT NULL,
  version TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  copy_id TEXT NOT NULL,
  condition TEXT NOT NULL,
  status TEXT NOT NULL,
  date_acquired TEXT NOT NULL,
  last_rented_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE inventory_create (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  copy_id TEXT NOT NULL,
  condition TEXT NOT NULL,
  status TEXT NOT NULL,
  date_acquired TEXT NOT NULL,
  last_rented_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE inventory_update (
  id TEXT PRIMARY KEY,
  video_id TEXT,
  copy_id TEXT,
  condition TEXT,
  status TEXT,
  date_acquired TEXT,
  last_rented_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE payment (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  rental_id TEXT,
  amount TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  reference_number TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE payment_create (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  rental_id TEXT,
  amount TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  reference_number TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE payment_method (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE payment_status (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE payment_type (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE rental (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  inventory_id TEXT NOT NULL,
  period TEXT NOT NULL,
  rental_fee TEXT NOT NULL,
  late_fee TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE rental_status (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.address (
  id TEXT PRIMARY KEY,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.address_update (
  id TEXT PRIMARY KEY,
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.email (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.email_update (
  id TEXT PRIMARY KEY,
  value TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.money (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.phone_number (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.phone_number_update (
  id TEXT PRIMARY KEY,
  value TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.rental_period (
  id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.standard_rental_duration (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE value_objects.state (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE video (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT NOT NULL,
  director TEXT NOT NULL,
  rental_price REAL NOT NULL,
  available_copies INTEGER NOT NULL,
  total_copies INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE video_create (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT NOT NULL,
  director TEXT NOT NULL,
  rental_price REAL NOT NULL,
  available_copies INTEGER NOT NULL,
  total_copies INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE TABLE video_update (
  id TEXT PRIMARY KEY,
  title TEXT,
  genre TEXT,
  rating TEXT,
  release_year INTEGER,
  duration INTEGER,
  description TEXT,
  director TEXT,
  rental_price REAL,
  available_copies INTEGER,
  total_copies INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_customer_name ON customer(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_email_unique ON customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_member_since ON customer(member_since);

CREATE INDEX IF NOT EXISTS idx_video_title ON video(title);
CREATE INDEX IF NOT EXISTS idx_video_genre ON video(genre);
CREATE INDEX IF NOT EXISTS idx_video_rating ON video(rating);
CREATE INDEX IF NOT EXISTS idx_video_description ON video(description);