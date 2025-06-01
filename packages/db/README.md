# @video-rental/db

A high-performance SQLite database package optimized for modern web applications. This package provides both a powerful schema generator and a feature-rich database client built on top of the excellent [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) library.

## Features

- 🚀 **Zero-latency database operations** - SQLite runs embedded in your application
- 🔧 **Automatic schema generation** from OpenAPI specifications
- ⚡ **Performance optimized** with SQLite best practices built-in
- 🛡️ **Type-safe** with full TypeScript support
- 🔄 **Transaction support** with automatic rollback
- 📊 **Comprehensive indexing strategy** for optimal query performance
- 🧹 **Maintenance utilities** for database optimization

## Installation

```bash
npm install @video-rental/db
```

## Quick Start

### Schema Generation

Generate optimized SQLite schemas from your OpenAPI component schemas:

```typescript
import { generateSqlSchema, loadComponentsSchemasFromFile } from "@video-rental/db";

// Load schemas from OpenAPI spec
const schemas = loadComponentsSchemasFromFile("./openapi.json");

// Generate optimized SQLite schema
const sqlSchema = generateSqlSchema(schemas, {
  useStrictMode: true, // Use WITHOUT ROWID for better performance
  includeIndexes: true, // Auto-generate indexes for optimal queries
  includeTimestamps: true, // Add created_at/updated_at columns
  includeFilePragmas: true, // Include performance pragmas
});

console.log(sqlSchema);
```

### Database Client

Use the high-performance database client:

```typescript
import { DbClient } from "@video-rental/db";

// Create database (file-based with optimizations)
const db = new DbClient("./app.db");

// Or in-memory for testing
const testDb = new DbClient(); // defaults to :memory:

// Simple queries
const users = db.query("SELECT * FROM users WHERE active = ?", [true]);
const user = db.queryOne("SELECT * FROM users WHERE id = ?", [123]);

// Transactions
const result = db.transaction(() => {
  const result1 = db.execute("INSERT INTO users (name, email) VALUES (?, ?)", [
    "John",
    "john@example.com",
  ]);
  const result2 = db.execute("INSERT INTO profiles (user_id, bio) VALUES (?, ?)", [
    result1.lastInsertRowid,
    "Software Developer",
  ]);
  return { userId: result1.lastInsertRowid, profileId: result2.lastInsertRowid };
});

// Close when done
db.close();
```

## Why SQLite?

Based on [SQLite's own documentation](https://www.sqlite.org/whentouse.html), SQLite is an excellent choice for:

### ✅ Perfect Use Cases

- **Most web applications** (handles 100K+ requests/day easily)
- **Embedded applications** and edge computing
- **Development and testing** (no setup required)
- **Single-server deployments** with moderate write concurrency
- **Data analysis and reporting** applications
- **File-based applications** and data containers

### 🎯 Key Benefits

- **Zero latency** - No network round trips
- **Simplified deployment** - One less service to manage
- **Cost effective** - No separate database server
- **ACID compliant** - Full transaction support
- **Backup friendly** - Single file to backup
- **Cross-platform** - Works everywhere

### ⚠️ Consider Alternatives When

- High write concurrency (>1000 concurrent writers)
- Multi-server deployments requiring real-time sync
- Database size >100GB (though SQLite supports up to 281TB)
- Need for database-specific features (PostGIS, etc.)

## Performance Optimizations

This package implements SQLite best practices automatically:

### Pragma Settings

```sql
PRAGMA journal_mode = WAL;           -- Write-Ahead Logging for concurrency
PRAGMA synchronous = NORMAL;         -- Balanced durability vs performance
PRAGMA cache_size = -64000;          -- 64MB cache (negative = KB)
PRAGMA foreign_keys = ON;            -- Referential integrity
PRAGMA temp_store = MEMORY;          -- In-memory temporary tables
PRAGMA mmap_size = 268435456;        -- 256MB memory-mapped I/O
PRAGMA page_size = 4096;             -- Optimal page size
PRAGMA auto_vacuum = INCREMENTAL;    -- Prevent database bloat
```

### Intelligent Indexing

The schema generator automatically creates indexes for:

- **Foreign keys** - Essential for JOIN performance
- **Search fields** - Text fields with names like `name`, `title`, `description`
- **Email fields** - Unique indexes for email columns
- **Boolean fields** - For status/flag filtering
- **Enum fields** - For category filtering
- **Range fields** - Numeric fields like `price`, `amount`, `rating`
- **Timestamps** - For sorting and date range queries

### Strict Mode Support

Enable strict mode for better performance on UUID-based applications:

```typescript
const schema = generateSqlSchema(schemas, {
  useStrictMode: true, // Uses WITHOUT ROWID tables
});
```

**Strict Mode Benefits:**

- Faster lookups with explicit primary keys
- Better memory efficiency
- Ideal for UUID primary keys
- No hidden rowid column

## API Reference

### Schema Generation

#### `generateSqlSchema(schemas, options)`

Generate SQLite schema from OpenAPI component schemas.

**Parameters:**

- `schemas` - OpenAPI component schemas object
- `options` - Schema generation options

**Options:**

```typescript
interface SqlSchemaOptions {
  includeFilePragmas?: boolean; // Include performance pragmas (default: true)
  includeTimestamps?: boolean; // Add created_at/updated_at (default: true)
  includeIndexes?: boolean; // Generate indexes (default: true)
  useStrictMode?: boolean; // Use WITHOUT ROWID (default: false)
  tableNameMap?: Record<string, string>; // Custom table names
  excludeSchemas?: string[]; // Schemas to skip
  includeSchemas?: string[]; // Only include these schemas
}
```

#### `generateSqlSchemaFile(schemas, outputPath, options)`

Generate schema and write to file.

#### `loadComponentsSchemasFromFile(filePath)`

Load OpenAPI schemas from JSON file.

### Database Client

#### `new DbClient(dbPath?, options?)`

Create a new database client.

**Parameters:**

- `dbPath` - Database file path (default: `:memory:`)
- `options` - Client options

#### Core Operations

```typescript
// Query operations
db.query<T>(sql, params?)          // Execute SELECT and return all rows
db.queryOne<T>(sql, params?)       // Execute SELECT and return first row
db.execute(sql, params?)           // Execute INSERT/UPDATE/DELETE

// Transaction support
db.transaction(fn)                 // Execute function in transaction
db.begin() / db.commit() / db.rollback()  // Manual transaction control

// Low-level operations
db.prepare(sql)                    // Prepare statement
db.run(stmt, params?)              // Execute prepared statement
db.get<T>(stmt, params?)           // Get single row from prepared statement
db.all<T>(stmt, params?)           // Get all rows from prepared statement
```

#### Maintenance Operations

```typescript
// Database maintenance
db.vacuum()                        // Reclaim space and optimize
db.incrementalVacuum(pages?)       // Partial vacuum
db.analyze()                       // Update query planner statistics

// Information and diagnostics
db.getDatabaseSize()               // Get size information
db.getDatabaseInfo()               // Get database metadata
db.integrityCheck()                // Check database integrity
db.pragma(name, value?)            // Get/set pragma values
```

## Examples

### Complete Application Setup

```typescript
import { DbClient, generateSqlSchemaFile, loadComponentsSchemasFromFile } from "@video-rental/db";

// 1. Generate schema from OpenAPI spec
const schemas = loadComponentsSchemasFromFile("./src/openapi.json");
generateSqlSchemaFile(schemas, "./database/schema.sql", {
  useStrictMode: true,
  includeIndexes: true,
  includeTimestamps: true,
});

// 2. Initialize database
const db = new DbClient("./data/app.db");

// 3. Apply schema
const schema = fs.readFileSync("./database/schema.sql", "utf8");
db.exec(schema);

// 4. Use in your application
export { db };
```

### Repository Pattern

```typescript
import { DbClient } from "@video-rental/db";

export class UserRepository {
  constructor(private db: DbClient) {}

  async findById(id: string): Promise<User | undefined> {
    return this.db.queryOne<User>("SELECT * FROM users WHERE id = ?", [id]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db.queryOne<User>("SELECT * FROM users WHERE email = ?", [email]);
  }

  async create(userData: CreateUserData): Promise<User> {
    return this.db.transaction(() => {
      const result = this.db.execute("INSERT INTO users (id, name, email) VALUES (?, ?, ?)", [
        userData.id,
        userData.name,
        userData.email,
      ]);

      return this.findById(userData.id)!;
    });
  }

  async update(id: string, updates: Partial<User>): Promise<User | undefined> {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updates), id];

    this.db.execute(
      `UPDATE users SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }
}
```

### Testing with In-Memory Database

```typescript
import { test, beforeEach } from "node:test";
import { DbClient } from "@video-rental/db";

let testDb: DbClient;

beforeEach(() => {
  // Each test gets a fresh in-memory database
  testDb = new DbClient(); // defaults to :memory:

  // Apply test schema
  testDb.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
});

test("user creation", () => {
  const result = testDb.execute("INSERT INTO users (id, name, email) VALUES (?, ?, ?)", [
    "123",
    "John Doe",
    "john@example.com",
  ]);

  assert.strictEqual(result.changes, 1);

  const user = testDb.queryOne("SELECT * FROM users WHERE id = ?", ["123"]);
  assert.strictEqual(user?.name, "John Doe");
});
```

### Database Maintenance

```typescript
import { DbClient } from "@video-rental/db";

const db = new DbClient("./app.db");

// Regular maintenance routine
function performMaintenance() {
  // Check database integrity
  const integrityCheck = db.integrityCheck();
  if (integrityCheck[0] !== "ok") {
    console.error("Database integrity issues:", integrityCheck);
  }

  // Update query planner statistics
  db.analyze();

  // Reclaim space if database is large
  const size = db.getDatabaseSize();
  if (size.totalSizeBytes > 100 * 1024 * 1024) {
    // > 100MB
    console.log("Running incremental vacuum...");
    db.incrementalVacuum();
  }

  console.log(`Database size: ${(size.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
}

// Run maintenance weekly
setInterval(performMaintenance, 7 * 24 * 60 * 60 * 1000);
```

## Best Practices

### 1. Use Transactions for Related Operations

```typescript
// ✅ Good - atomic operation
const result = db.transaction(() => {
  const userId = db.execute('INSERT INTO users (...) VALUES (...)', [...]).lastInsertRowid;
  const profileId = db.execute('INSERT INTO profiles (...) VALUES (...)', [userId, ...]).lastInsertRowid;
  return { userId, profileId };
});

// ❌ Bad - separate operations can fail independently
const userId = db.execute('INSERT INTO users (...) VALUES (...)', [...]).lastInsertRowid;
const profileId = db.execute('INSERT INTO profiles (...) VALUES (...)', [userId, ...]).lastInsertRowid;
```

### 2. Use Prepared Statements for Repeated Queries

```typescript
// ✅ Good - prepare once, execute many times
const insertUser = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
for (const user of users) {
  db.run(insertUser, [user.name, user.email]);
}

// ❌ Bad - parsing overhead for each execution
for (const user of users) {
  db.execute("INSERT INTO users (name, email) VALUES (?, ?)", [user.name, user.email]);
}
```

### 3. Index Strategy

```typescript
// ✅ Good - index foreign keys and search fields
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_users_email_unique ON users(email);
CREATE INDEX idx_products_name ON products(name);

// ❌ Bad - over-indexing slows down writes
CREATE INDEX idx_users_every_column ON users(id, name, email, phone, address, city, state);
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = db.transaction(() => {
    // Multiple operations...
    return someResult;
  });
} catch (error) {
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    throw new Error("Email already exists");
  }
  throw error; // Re-throw unexpected errors
}
```
