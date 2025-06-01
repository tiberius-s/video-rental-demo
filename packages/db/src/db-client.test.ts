import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

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

  describe("performance and maintenance utilities", () => {
    beforeEach(() => {
      // Create test table with some data
      client.exec(`
        CREATE TABLE test_maintenance (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          data TEXT
        )
      `);

      // Insert test data
      for (let i = 1; i <= 10; i++) {
        client.execute("INSERT INTO test_maintenance (name, data) VALUES (?, ?)", [
          `name${i}`,
          `data${i}`,
        ]);
      }
    });

    test("should run vacuum successfully", () => {
      // Insert and delete some data to create fragmentation
      client.execute("INSERT INTO test_maintenance (name, data) VALUES (?, ?)", ["temp", "temp"]);
      client.execute("DELETE FROM test_maintenance WHERE name = ?", ["temp"]);

      // Run vacuum - should not throw
      assert.doesNotThrow(() => {
        client.vacuum();
      }, "Vacuum should execute without error");
    });

    test("should run incremental vacuum successfully", () => {
      assert.doesNotThrow(() => {
        client.incrementalVacuum();
      }, "Incremental vacuum should execute without error");

      assert.doesNotThrow(() => {
        client.incrementalVacuum(10);
      }, "Incremental vacuum with pages should execute without error");
    });

    test("should run analyze successfully", () => {
      assert.doesNotThrow(() => {
        client.analyze();
      }, "Analyze should execute without error");
    });

    test("should get database size information", () => {
      const sizeInfo = client.getDatabaseSize();

      assert.ok(typeof sizeInfo.pageCount === "number", "Page count should be a number");
      assert.ok(typeof sizeInfo.pageSize === "number", "Page size should be a number");
      assert.ok(typeof sizeInfo.totalSizeBytes === "number", "Total size should be a number");
      assert.ok(sizeInfo.pageCount > 0, "Page count should be positive");
      assert.ok(sizeInfo.pageSize > 0, "Page size should be positive");
      assert.strictEqual(
        sizeInfo.totalSizeBytes,
        sizeInfo.pageCount * sizeInfo.pageSize,
        "Total size should equal page count times page size",
      );
    });

    test("should check database integrity", () => {
      const integrityResult = client.integrityCheck();

      assert.ok(Array.isArray(integrityResult), "Integrity check should return an array");
      assert.ok(integrityResult.length > 0, "Integrity check should return at least one result");

      // For a healthy database, first result should be "ok"
      const firstResult = integrityResult[0];
      assert.ok(typeof firstResult === "string", "Integrity result should be a string");
    });
  });

  describe("pragma management", () => {
    test("should get pragma values", () => {
      const journalMode = client.pragma<string>("journal_mode");
      assert.ok(typeof journalMode === "string", "Journal mode should be a string");

      const foreignKeys = client.pragma<number>("foreign_keys");
      assert.ok(typeof foreignKeys === "number", "Foreign keys should be a number");
    });

    test("should set pragma values", () => {
      // Test setting a pragma value
      client.pragma("cache_size", -32000);
      const cacheSize = client.pragma<number>("cache_size");
      assert.strictEqual(cacheSize, -32000, "Cache size should be updated");
    });

    test("should handle unknown pragma", () => {
      assert.throws(
        () => {
          client.pragma("unknown_pragma_name");
        },
        /Unknown pragma/,
        "Should throw for unknown pragma",
      );
    });

    test("should handle pragma result objects", () => {
      // Some pragmas return objects - test with compile_options which returns array of objects
      const compileOptions = client.pragma("compile_options");
      assert.ok(compileOptions !== undefined, "Compile options should return a result");
    });
  });

  describe("constructor options", () => {
    test("should skip pragma setup when requested", () => {
      const tempDbPath = path.join(os.tmpdir(), `no-pragma-test-${Date.now()}.db`);

      try {
        const clientWithoutPragmas = new DbClient(tempDbPath, { skipPragmaSetup: true });

        // Since pragmas are skipped, journal mode might not be WAL
        const journalMode = clientWithoutPragmas.pragma<string>("journal_mode");
        assert.ok(typeof journalMode === "string", "Journal mode should still be readable");

        clientWithoutPragmas.close();
      } finally {
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });

    test("should handle file database pragma setup correctly", () => {
      const tempDbPath = path.join(os.tmpdir(), `pragma-test-${Date.now()}.db`);

      try {
        const fileClient = new DbClient(tempDbPath);

        // Check that file-specific optimizations are applied
        const journalMode = fileClient.pragma<string>("journal_mode");
        const tempStore = fileClient.pragma<number>("temp_store");
        const foreignKeys = fileClient.pragma<number>("foreign_keys");

        assert.strictEqual(journalMode, "wal", "File database should use WAL mode");
        assert.strictEqual(tempStore, 2, "Temp store should be memory (value 2)");
        assert.strictEqual(foreignKeys, 1, "Foreign keys should be enabled");

        fileClient.close();
      } finally {
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });
  });

  describe("query helpers comprehensive coverage", () => {
    beforeEach(() => {
      client.exec(`
        CREATE TABLE comprehensive_test (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          value REAL,
          active BOOLEAN DEFAULT 1
        )
      `);
    });

    test("should handle query with no results", () => {
      const results = client.query<TestRow>("SELECT * FROM comprehensive_test WHERE id = ?", [999]);
      assert.strictEqual(results.length, 0, "Query with no results should return empty array");
    });

    test("should handle queryOne with no results", () => {
      const result = client.queryOne<TestRow>("SELECT * FROM comprehensive_test WHERE id = ?", [
        999,
      ]);
      assert.strictEqual(result, undefined, "QueryOne with no results should return undefined");
    });

    test("should handle execute with no parameters", () => {
      const result = client.execute("INSERT INTO comprehensive_test (name) VALUES ('test')");
      assert.strictEqual(result.changes, 1, "Execute without parameters should work");
      assert.ok(result.lastInsertRowid, "Should return insert ID");
    });

    test("should handle complex queries with multiple parameters", () => {
      // Insert test data (using 1/0 for boolean values as SQLite expects)
      client.execute("INSERT INTO comprehensive_test (name, value, active) VALUES (?, ?, ?)", [
        "test1",
        1.5,
        1,
      ]);
      client.execute("INSERT INTO comprehensive_test (name, value, active) VALUES (?, ?, ?)", [
        "test2",
        2.5,
        0,
      ]);
      client.execute("INSERT INTO comprehensive_test (name, value, active) VALUES (?, ?, ?)", [
        "test3",
        3.5,
        1,
      ]);

      // Complex query with multiple conditions
      const results = client.query(
        "SELECT * FROM comprehensive_test WHERE value > ? AND active = ? ORDER BY value",
        [2.0, 1],
      );

      assert.strictEqual(results.length, 1, "Should find one matching record");
      assert.strictEqual(results[0].name, "test3", "Should return correct record");
    });
  });

  describe("backup functionality", () => {
    test("should backup database successfully", async () => {
      const backupPath = path.join(os.tmpdir(), `backup-test-${Date.now()}.db`);

      try {
        // Create some test data
        client.exec("CREATE TABLE backup_test (id INTEGER, name TEXT)");
        client.execute("INSERT INTO backup_test VALUES (?, ?)", [1, "test"]);

        // Perform backup
        await client.backup(backupPath);

        // Verify backup file exists
        assert.ok(fs.existsSync(backupPath), "Backup file should exist");

        // Verify backup contains data by opening it
        const backupClient = new DbClient(backupPath);
        const data = backupClient.queryOne<BackupTestRow>(
          "SELECT * FROM backup_test WHERE id = ?",
          [1],
        );
        assert.ok(data, "Backup should contain test data");
        assert.strictEqual(data.name, "test", "Backup data should match original");

        backupClient.close();
      } finally {
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
        }
      }
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

    test("should handle large transactions", () => {
      client.exec("CREATE TABLE large_test (id INTEGER, data TEXT)");

      const result = client.transaction(() => {
        let insertCount = 0;
        const stmt = client.prepare("INSERT INTO large_test (data) VALUES (?)");

        for (let i = 0; i < 1000; i++) {
          const insertResult = client.run(stmt, [`data${i}`]);
          if (insertResult.changes === 1) {
            insertCount++;
          }
        }

        return insertCount;
      });

      assert.strictEqual(result, 1000, "Should insert all 1000 records in transaction");

      // Verify count
      const count = client.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM large_test");
      assert.strictEqual(count?.count, 1000, "Database should contain all records");
    });

    test("should handle transaction rollback on error", () => {
      client.exec("CREATE TABLE rollback_test (id INTEGER PRIMARY KEY, name TEXT UNIQUE)");

      // Insert initial data
      client.execute("INSERT INTO rollback_test (name) VALUES (?)", ["initial"]);

      // Try transaction that should fail due to unique constraint
      assert.throws(() => {
        client.transaction(() => {
          client.execute("INSERT INTO rollback_test (name) VALUES (?)", ["valid"]);
          client.execute("INSERT INTO rollback_test (name) VALUES (?)", ["initial"]); // Should fail
        });
      }, "Transaction should throw on constraint violation");

      // Verify rollback - only initial record should exist
      const count = client.queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM rollback_test",
      );
      assert.strictEqual(count?.count, 1, "Transaction should be rolled back");

      const remaining = client.queryOne<{ name: string }>("SELECT name FROM rollback_test");
      assert.strictEqual(remaining?.name, "initial", "Only initial record should remain");
    });

    test("should handle concurrent access patterns", () => {
      const tempDbPath = path.join(os.tmpdir(), `concurrent-test-${Date.now()}.db`);

      try {
        const client1 = new DbClient(tempDbPath);
        const client2 = new DbClient(tempDbPath);

        client1.exec("CREATE TABLE concurrent_test (id INTEGER PRIMARY KEY, data TEXT)");

        // Simulate concurrent writes (they will be serialized by SQLite)
        client1.execute("INSERT INTO concurrent_test (data) VALUES (?)", ["client1_data"]);
        client2.execute("INSERT INTO concurrent_test (data) VALUES (?)", ["client2_data"]);

        // Both clients should see both records
        const count1 = client1.queryOne<{ count: number }>(
          "SELECT COUNT(*) as count FROM concurrent_test",
        );
        const count2 = client2.queryOne<{ count: number }>(
          "SELECT COUNT(*) as count FROM concurrent_test",
        );

        assert.strictEqual(count1?.count, 2, "Client 1 should see both records");
        assert.strictEqual(count2?.count, 2, "Client 2 should see both records");

        client1.close();
        client2.close();
      } finally {
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });
  });

  describe("additional coverage tests", () => {
    test("should handle pragma edge cases comprehensively", () => {
      // Test various pragma edge cases to improve coverage

      // Test setting pragma with boolean
      client.pragma("foreign_keys", true);
      const foreignKeys = client.pragma<number>("foreign_keys");
      assert.strictEqual(foreignKeys, 1, "Boolean true should set pragma to 1");

      // Test setting pragma with false
      client.pragma("foreign_keys", false);
      const foreignKeysOff = client.pragma<number>("foreign_keys");
      assert.strictEqual(foreignKeysOff, 0, "Boolean false should set pragma to 0");

      // Test pragma that returns object-like results
      client.exec("CREATE TABLE test_pragma (id INTEGER, name TEXT)");
      const tableInfo = client.pragma("table_info", "test_pragma");
      assert.ok(tableInfo !== undefined, "Table info should return results");
    });

    test("should handle pragma result objects correctly", () => {
      // Test with table_info which returns object array
      client.exec("CREATE TABLE pragma_test (id INTEGER, name TEXT)");
      const tableInfo = client.pragma("table_info", "pragma_test");
      assert.ok(tableInfo !== undefined, "Table info should return results");
    });

    test("should handle file optimization setup edge cases", () => {
      const tempDbPath = path.join(os.tmpdir(), `edge-test-${Date.now()}.db`);

      try {
        const fileClient = new DbClient(tempDbPath);

        // Test that journal mode is already WAL and doesn't need changing
        const initialMode = fileClient.pragma<string>("journal_mode");
        assert.strictEqual(initialMode, "wal", "Should already be in WAL mode");

        // Create another client to test journal mode detection
        const fileClient2 = new DbClient(tempDbPath);
        const mode2 = fileClient2.pragma<string>("journal_mode");
        assert.strictEqual(mode2, "wal", "Second client should also see WAL mode");

        fileClient.close();
        fileClient2.close();
      } finally {
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      }
    });

    test("should handle various pragma result types", () => {
      // Test different pragma return types to improve branch coverage
      const cacheSize = client.pragma<number>("cache_size");
      assert.ok(typeof cacheSize === "number", "Cache size should be number");

      const foreignKeys = client.pragma<number>("foreign_keys");
      assert.ok(typeof foreignKeys === "number", "Foreign keys should be number");

      const journalMode = client.pragma<string>("journal_mode");
      assert.ok(typeof journalMode === "string", "Journal mode should be string");
    });

    test("should handle backup to existing directory", async () => {
      const tempDir = os.tmpdir();
      const backupPath = path.join(tempDir, `existing-dir-backup-${Date.now()}.db`);

      try {
        // Create test data
        client.exec("CREATE TABLE existing_test (id INTEGER, data TEXT)");
        client.execute("INSERT INTO existing_test VALUES (?, ?)", [1, "backup_test"]);

        // Backup to existing directory
        await client.backup(backupPath);

        // Verify backup
        assert.ok(fs.existsSync(backupPath), "Backup should be created in existing directory");

        const backupClient = new DbClient(backupPath);
        const data = backupClient.queryOne<{ data: string }>(
          "SELECT data FROM existing_test WHERE id = ?",
          [1],
        );
        assert.strictEqual(data?.data, "backup_test", "Backup data should be preserved");
        backupClient.close();
      } finally {
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
        }
      }
    });

    test("should handle database info for readonly databases", () => {
      // Test getDatabaseInfo with different database states
      const info = client.getDatabaseInfo();
      assert.strictEqual(typeof info.readonly, "boolean", "Readonly should be boolean");
      assert.strictEqual(info.readonly, false, "In-memory database should not be readonly");
    });

    test("should handle maintenance operations on empty database", () => {
      // Test maintenance operations on database without data
      assert.doesNotThrow(() => {
        client.vacuum();
      }, "Vacuum should work on empty database");

      assert.doesNotThrow(() => {
        client.analyze();
      }, "Analyze should work on empty database");

      const sizeInfo = client.getDatabaseSize();
      assert.ok(sizeInfo.pageCount >= 0, "Page count should be non-negative");
    });

    test("should handle various error conditions in pragma", () => {
      // Test pragma error handling
      assert.throws(() => {
        client.pragma("completely_invalid_pragma_name_that_does_not_exist");
      }, "Should throw for completely invalid pragma");
    });
  });
});
