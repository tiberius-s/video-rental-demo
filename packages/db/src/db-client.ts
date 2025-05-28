import SQLite, { type Database, type Statement } from "better-sqlite3";

export class DbClient {
  readonly #db: Database;
  constructor(dbName = ":memory:") {
    this.#db = new SQLite(dbName);
    // Only set WAL mode for file databases, in-memory databases use "memory" mode
    if (dbName !== ":memory:") {
      this.#db.pragma("journal_mode = WAL");
    }
  }

  close() {
    this.#db.close();
  }

  exec(sql: string): Database {
    return this.#db.exec(sql);
  }

  prepare(sql: string): Statement {
    return this.#db.prepare(sql);
  }

  run(stmt: Statement, params?: unknown[]): SQLite.RunResult {
    return params ? stmt.run(params) : stmt.run();
  }

  // Additional suggested operations:

  // Get a single row
  get<T = unknown>(stmt: Statement, params: unknown[] = []): T | undefined {
    return stmt.get(params) as T | undefined;
  }

  // Get all rows
  all<T = unknown>(stmt: Statement, params: unknown[] = []): T[] {
    return stmt.all(params) as T[];
  }

  // Transaction support
  transaction<T>(fn: () => T): T {
    const txn = this.#db.transaction(fn);
    return txn();
  }

  // Begin transaction manually
  begin(): void {
    this.#db.exec("BEGIN");
  }

  // Commit transaction
  commit(): void {
    this.#db.exec("COMMIT");
  }

  // Rollback transaction
  rollback(): void {
    this.#db.exec("ROLLBACK");
  }

  // Check if database is open
  get isOpen(): boolean {
    return this.#db.open;
  }

  // Get database info
  getDatabaseInfo(): {
    memory: boolean;
    readonly: boolean;
    name: string;
  } {
    return {
      memory: this.#db.memory,
      readonly: this.#db.readonly,
      name: this.#db.memory ? "" : this.#db.name, // Return empty string for in-memory databases
    };
  }

  // Backup database
  async backup(destinationPath: string): Promise<void> {
    await this.#db.backup(destinationPath);
  }

  // Set pragma values
  pragma<T = unknown>(name: string, value?: string | number | boolean): T {
    if (value !== undefined) {
      return this.#db.pragma(`${name} = ${value}`) as T;
    }
    const result = this.#db.pragma(name);

    // Check if the pragma is invalid (SQLite returns empty array for unknown pragmas)
    if (Array.isArray(result) && result.length === 0) {
      throw new Error(`Unknown pragma: ${name}`);
    }

    // Extract the value from the result array if it's an array
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      typeof result[0] === "object" &&
      result[0] !== null
    ) {
      return (result[0] as Record<string, unknown>)[name] as T;
    }
    return result as T;
  }

  // Convenience method for simple queries
  query<T = unknown>(sql: string, params: unknown[] = []): T[] {
    const stmt = this.prepare(sql);
    return this.all<T>(stmt, params);
  }

  // Convenience method for single row queries
  queryOne<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
    const stmt = this.prepare(sql);
    return this.get<T>(stmt, params);
  }

  // Execute and return run result
  execute(sql: string, params: unknown[] = []): SQLite.RunResult {
    const stmt = this.prepare(sql);
    return this.run(stmt, params);
  }
}
