import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { DbClient } from "./db-client.js";

/**
 * Test interfaces for database rows
 */
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface TestRow {
  id: number;
  value: string;
}

interface BackupTestRow {
  id: number;
  name: string;
}

interface CounterRow {
  id: number;
  count: number;
}

interface NullableTestRow {
  id: number;
  value: string | null;
}

describe("DbClient", () => {
  let client: DbClient;

  /**
   * Create a fresh in-memory database instance before each test
   */
  beforeEach(() => {
    client = new DbClient();
  });

  /**
   * Clean up database connection after each test to prevent resource leaks
   */
  afterEach(() => {
    if (client?.isOpen) {
      client.close();
    }
  });

  describe("constructor", () => {
    test("should create an in-memory database by default", () => {
      const info = client.getDatabaseInfo();
      assert.strictEqual(info.memory, true, "Should be in-memory database");
      assert.strictEqual(info.name, "", "In-memory database should have empty name");
    });

    test("should create a file database when path is provided", () => {
      const tempDbPath = path.join(os.tmpdir(), "test.db");
      const fileClient = new DbClient(tempDbPath);

      try {
        const info = fileClient.getDatabaseInfo();
        assert.strictEqual(info.memory, false, "Should be file database");
        assert.strictEqual(info.name, tempDbPath, "Database name should match file path");
      } finally {
        fileClient.close();
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });

    test("should set correct journal mode for in-memory databases", () => {
      const journalMode = client.pragma<string>("journal_mode");
      assert.strictEqual(
        journalMode,
        "memory",
        "In-memory databases should use memory journal mode",
      );
    });

    test("should set WAL journal mode for file databases", () => {
      const tempDbPath = path.join(os.tmpdir(), "wal-test.db");
      const fileClient = new DbClient(tempDbPath);

      try {
        const journalMode = fileClient.pragma<string>("journal_mode");
        assert.strictEqual(journalMode, "wal", "File databases should use WAL journal mode");
      } finally {
        fileClient.close();
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });
  });

  describe("basic operations", () => {
    test("should execute SQL statements", () => {
      const result = client.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
      assert.ok(result, "SQL execution should succeed");

      // Verify table was created by inserting data
      client.execute("INSERT INTO test (name) VALUES (?)", ["test"]);
      const count = client.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM test");
      assert.ok(count, "Query should return result");
      assert.strictEqual(count.count, 1, "Table should contain one row");
    });

    test("should prepare statements", () => {
      client.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
      const stmt = client.prepare("INSERT INTO test (name) VALUES (?)");
      assert.ok(stmt, "Statement preparation should succeed");
    });

    test("should run prepared statements", () => {
      client.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
      const stmt = client.prepare("INSERT INTO test (name) VALUES (?)");
      const result = client.run(stmt, ["John"]);

      assert.strictEqual(result.changes, 1, "Should affect one row");
      assert.strictEqual(result.lastInsertRowid, 1, "Should return correct row ID");
    });

    test("should handle run with no parameters", () => {
      client.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT DEFAULT 'default')");
      const stmt = client.prepare("INSERT INTO test DEFAULT VALUES");
      const result = client.run(stmt);

      assert.strictEqual(result.changes, 1, "Should insert one row");
      assert.strictEqual(result.lastInsertRowid, 1, "Should return first row ID");
    });

    test("should handle prepare with invalid SQL", () => {
      assert.throws(
        () => client.prepare("INVALID SQL SYNTAX"),
        /syntax error/i,
        "Should throw syntax error for invalid SQL",
      );
    });
  });

  describe("query operations", () => {
    /**
     * Setup test data before each query test
     */
    beforeEach(() => {
      // Create users table with constraints
      client.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          age INTEGER
        )
      `);

      // Insert test users
      const insertStmt = client.prepare("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");
      client.run(insertStmt, ["John Doe", "john@example.com", 30]);
      client.run(insertStmt, ["Jane Smith", "jane@example.com", 25]);
    });

    test("should get a single row", () => {
      // Prepare and execute query for single user
      const stmt = client.prepare("SELECT * FROM users WHERE id = ?");
      const user = client.get<User>(stmt, [1]);

      // Verify all user properties
      assert.ok(user, "User should exist");
      assert.strictEqual(user.id, 1, "User ID should match");
      assert.strictEqual(user.name, "John Doe", "User name should match");
      assert.strictEqual(user.email, "john@example.com", "User email should match");
      assert.strictEqual(user.age, 30, "User age should match");
    });

    test("should get all rows", () => {
      // Get all users ordered by ID
      const stmt = client.prepare("SELECT * FROM users ORDER BY id");
      const users = client.all<User>(stmt);

      // Verify result count and data
      assert.strictEqual(users.length, 2, "Should return 2 users");
      assert.strictEqual(users[0].name, "John Doe", "First user should be John");
      assert.strictEqual(users[1].name, "Jane Smith", "Second user should be Jane");
    });

    test("should handle empty results", () => {
      // Query for non-existent user
      const stmt = client.prepare("SELECT * FROM users WHERE id = ?");

      // Test get method with no results
      const user = client.get(stmt, [999]);
      assert.strictEqual(user, undefined, "Non-existent user should be undefined");

      // Test all method with no results
      const users = client.all(stmt, [999]);
      assert.strictEqual(users.length, 0, "Empty result should have length 0");
    });
  });

  describe("convenience methods", () => {
    /**
     * Setup test table before each convenience method test
     */
    beforeEach(() => {
      client.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)");
    });

    test("query() should return multiple rows", () => {
      // Insert test data
      client.execute("INSERT INTO test (value) VALUES (?)", ["test1"]);
      client.execute("INSERT INTO test (value) VALUES (?)", ["test2"]);

      // Query all rows in order with generic type
      const results = client.query<TestRow>("SELECT * FROM test ORDER BY id");
      assert.strictEqual(results.length, 2, "Should return 2 rows");
      assert.strictEqual(results[0].value, "test1", "First row should match");
      assert.strictEqual(results[1].value, "test2", "Second row should match");
    });

    test("queryOne() should return single row", () => {
      // Insert single test row
      client.execute("INSERT INTO test (value) VALUES (?)", ["single"]);

      // Query for specific row with generic type
      const result = client.queryOne<TestRow>("SELECT * FROM test WHERE id = ?", [1]);
      assert.ok(result, "Expected result to be defined");
      assert.strictEqual(result.value, "single", "Row value should match");
    });

    test("execute() should return run result", () => {
      // Execute insert and verify metadata
      const result = client.execute("INSERT INTO test (value) VALUES (?)", ["executed"]);
      assert.strictEqual(result.changes, 1, "Should affect one row");
      assert.strictEqual(result.lastInsertRowid, 1, "Should return correct row ID");
    });

    test("query() should handle no parameters", () => {
      // Insert test data and query without parameters
      client.execute("INSERT INTO test (value) VALUES (?)", ["test"]);
      const results = client.query<TestRow>("SELECT * FROM test");
      assert.strictEqual(results.length, 1, "Should return one row");
    });

    test("queryOne() should handle no parameters", () => {
      // Insert test data and query without parameters
      client.execute("INSERT INTO test (value) VALUES (?)", ["test"]);
      const result = client.queryOne<TestRow>("SELECT * FROM test LIMIT 1");
      assert.ok(result, "Expected result to be defined");
      assert.strictEqual(result.value, "test", "Row value should match");
    });

    test("execute() should handle no parameters", () => {
      // Execute delete without parameters on empty table
      const result = client.execute("DELETE FROM test");
      assert.strictEqual(result.changes, 0, "Should affect zero rows on empty table");
    });

    test("queryOne() should return undefined for no results", () => {
      // Query for non-existent row
      const result = client.queryOne<TestRow>("SELECT * FROM test WHERE id = ?", [999]);
      assert.strictEqual(result, undefined, "Non-existent row should return undefined");
    });
  });

  describe("transactions", () => {
    /**
     * Setup counter table for transaction testing
     */
    beforeEach(() => {
      client.exec("CREATE TABLE counter (id INTEGER PRIMARY KEY, count INTEGER DEFAULT 0)");
      client.execute("INSERT INTO counter (count) VALUES (?)", [0]);
    });

    test("transaction() should commit on success", () => {
      // Execute transaction that modifies counter twice
      const result = client.transaction(() => {
        client.execute("UPDATE counter SET count = count + 1 WHERE id = 1");
        client.execute("UPDATE counter SET count = count + 1 WHERE id = 1");
        return "success";
      });

      // Verify transaction completed and changes persisted
      assert.strictEqual(result, "success", "Transaction should return expected value");
      const count = client.queryOne<CounterRow>("SELECT count FROM counter WHERE id = 1");
      assert.ok(count, "Expected count result to be defined");
      assert.strictEqual(count.count, 2, "Counter should reflect both increments");
    });

    test("transaction() should rollback on error", () => {
      // Execute transaction that throws error after modification
      assert.throws(() => {
        client.transaction(() => {
          client.execute("UPDATE counter SET count = count + 1 WHERE id = 1");
          throw new Error("Test error");
        });
      }, "Transaction should propagate thrown error");

      // Verify changes were rolled back
      const count = client.queryOne<CounterRow>("SELECT count FROM counter WHERE id = 1");
      assert.ok(count, "Expected count result to be defined");
      assert.strictEqual(count.count, 0, "Counter should be unchanged after rollback");
    });

    test("manual transaction methods should work", () => {
      // Execute manual transaction with explicit begin/commit
      client.begin();
      client.execute("UPDATE counter SET count = count + 1 WHERE id = 1");
      client.commit();

      // Verify changes were committed
      const count = client.queryOne<CounterRow>("SELECT count FROM counter WHERE id = 1");
      assert.ok(count, "Expected count result to be defined");
      assert.strictEqual(count.count, 1, "Counter should reflect the increment");
    });

    test("rollback should undo changes", () => {
      // Execute manual transaction with explicit rollback
      client.begin();
      client.execute("UPDATE counter SET count = count + 1 WHERE id = 1");
      client.rollback();

      // Verify changes were rolled back
      const count = client.queryOne<CounterRow>("SELECT count FROM counter WHERE id = 1");
      assert.ok(count, "Expected count result to be defined");
      assert.strictEqual(count.count, 0, "Counter should be unchanged after rollback");
    });
  });

  describe("pragma operations", () => {
    test("should get pragma value", () => {
      // Get current journal mode (should be 'memory' for in-memory database)
      const journalMode = client.pragma<string>("journal_mode");
      assert.strictEqual(
        journalMode,
        "memory",
        "In-memory database should use memory journal mode",
      );
    });

    test("should set pragma value", () => {
      // Set synchronous mode to NORMAL and verify
      client.pragma("synchronous", "NORMAL");
      const sync = client.pragma<number>("synchronous");
      assert.strictEqual(sync, 1, "NORMAL synchronous mode should return 1"); // NORMAL = 1
    });

    test("should handle pragma with numeric value", () => {
      // Set cache size and verify (negative values represent page count)
      client.pragma("cache_size", -2000);
      const cacheSize = client.pragma<number>("cache_size");
      assert.strictEqual(cacheSize, -2000, "Cache size should match set value"); // SQLite cache_size uses negative values for page count
    });

    test("should handle invalid pragma", () => {
      // Attempt to access non-existent pragma
      assert.throws(() => {
        client.pragma("invalid_pragma_name");
      }, "Invalid pragma should throw error");
    });
  });

  describe("database state", () => {
    test("isOpen should return true for open database", () => {
      // Verify database connection is active
      assert.strictEqual(client.isOpen, true, "Active database should report as open");
    });

    test("isOpen should return false after close", () => {
      // Close database and verify state change
      client.close();
      assert.strictEqual(client.isOpen, false, "Closed database should report as closed");
    });

    test("getDatabaseInfo should return correct information", () => {
      // Verify database info has expected properties and types
      const info = client.getDatabaseInfo();
      assert.strictEqual(typeof info.memory, "boolean", "Memory flag should be boolean");
      assert.strictEqual(typeof info.readonly, "boolean", "Readonly flag should be boolean");
      assert.strictEqual(typeof info.name, "string", "Name should be string");
    });
  });

  describe("backup", () => {
    test("should backup to file", async () => {
      const backupFilePath = path.join(os.tmpdir(), `backup-test-${Date.now()}.db`);

      try {
        // Setup test data
        client.exec("CREATE TABLE test (id INTEGER, name TEXT)");
        client.execute("INSERT INTO test VALUES (?, ?)", [1, "test"]);

        // Perform backup
        await client.backup(backupFilePath);

        // Verify backup file exists
        assert.ok(fs.existsSync(backupFilePath), "Backup file should exist");

        // Verify backup content
        const backupClient = new DbClient(backupFilePath);
        try {
          const result = backupClient.queryOne<BackupTestRow>("SELECT * FROM test WHERE id = 1");
          assert.ok(result, "Backup should contain test data");
          assert.strictEqual(result.name, "test", "Backup data should match original");
        } finally {
          backupClient.close();
        }
      } finally {
        // Clean up backup file
        if (fs.existsSync(backupFilePath)) {
          fs.unlinkSync(backupFilePath);
        }
      }
    });

    test("should handle backup to invalid path", async () => {
      const invalidPath = path.join("/nonexistent", "directory", "backup.db");

      await assert.rejects(
        () => client.backup(invalidPath),
        /Cannot save backup because the directory does not exist/,
        "Should reject with directory not found error",
      );
    });

    test("should handle backup when database is closed", async () => {
      client.close();
      const backupFilePath = path.join(os.tmpdir(), `closed-backup-${Date.now()}.db`);

      await assert.rejects(
        () => client.backup(backupFilePath),
        /The database connection is not open/,
        "Should reject with connection closed error",
      );
    });
  });

  describe("error handling", () => {
    test("should throw on invalid SQL", () => {
      // Attempt to execute malformed SQL
      assert.throws(() => {
        client.exec("INVALID SQL STATEMENT");
      }, "Invalid SQL should throw syntax error");
    });

    test("should throw on constraint violation", () => {
      // Setup table with unique constraint
      client.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, email TEXT UNIQUE)");
      client.execute("INSERT INTO test (email) VALUES (?)", ["test@example.com"]);

      // Attempt to violate unique constraint
      assert.throws(() => {
        client.execute("INSERT INTO test (email) VALUES (?)", ["test@example.com"]);
      }, "Duplicate unique value should throw constraint error");
    });

    test("should throw when using closed database", () => {
      // Close database and attempt operations
      client.close();

      assert.throws(() => {
        client.exec("CREATE TABLE test (id INTEGER)");
      }, "Exec on closed database should throw");

      assert.throws(() => {
        client.prepare("SELECT 1");
      }, "Prepare on closed database should throw");

      assert.throws(() => {
        client.query("SELECT 1");
      }, "Query on closed database should throw");

      assert.throws(() => {
        client.execute("SELECT 1");
      }, "Execute on closed database should throw");

      assert.throws(() => {
        client.pragma("journal_mode");
      }, "Pragma on closed database should throw");
    });

    test("should throw on transaction operations with closed database", () => {
      // Close database and attempt transaction operations
      client.close();

      assert.throws(() => {
        client.begin();
      }, "Begin on closed database should throw");

      assert.throws(() => {
        client.commit();
      }, "Commit on closed database should throw");

      assert.throws(() => {
        client.rollback();
      }, "Rollback on closed database should throw");

      assert.throws(() => {
        client.transaction(() => "test");
      }, "Transaction on closed database should throw");
    });
  });

  describe("edge cases", () => {
    test("should handle multiple database connections", () => {
      // Create temporary database for multi-client testing
      const tempDbPath = path.join(os.tmpdir(), `multi-test-${Date.now()}.db`);

      try {
        const client1 = new DbClient(tempDbPath);
        const client2 = new DbClient(tempDbPath);

        // Write with first client and read with second
        client1.exec("CREATE TABLE IF NOT EXISTS test (id INTEGER, value TEXT)");
        client1.execute("INSERT INTO test VALUES (?, ?)", [1, "client1"]);

        const result = client2.queryOne<TestRow>("SELECT * FROM test WHERE id = ?", [1]);
        assert.ok(result, "Expected multi-client result to be defined");
        assert.strictEqual(result.value, "client1", "Second client should see first client's data");

        client1.close();
        client2.close();
      } finally {
        // Clean up temporary database file
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });

    test("should handle empty parameter arrays", () => {
      // Create table with default values and insert without parameters
      client.exec("CREATE TABLE test (id INTEGER DEFAULT 1, value TEXT DEFAULT 'default')");
      const stmt = client.prepare("INSERT INTO test DEFAULT VALUES");
      const result = client.run(stmt, []);
      assert.strictEqual(result.changes, 1, "Should insert one row with empty parameters");
    });

    test("should handle null and undefined values in parameters", () => {
      // Insert null value and verify proper handling
      client.exec("CREATE TABLE test (id INTEGER, value TEXT)");
      const result = client.execute("INSERT INTO test VALUES (?, ?)", [1, null]);
      assert.strictEqual(result.changes, 1, "Should insert row with null value");

      // Verify null value was stored correctly
      const row = client.queryOne<NullableTestRow>("SELECT * FROM test WHERE id = ?", [1]);
      assert.ok(row, "Expected row to be defined");
      assert.strictEqual(row.value, null, "Null value should be preserved");
    });
  });
});
