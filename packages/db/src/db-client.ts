import SQLite, { type Database, type Statement } from "better-sqlite3";

export interface DbClientOptions {
  skipPragmaSetup?: boolean;
}

export interface DatabaseInfo {
  memory: boolean;
  readonly: boolean;
  name: string;
}

const MEMORY_DB_NAME = ":memory:";
const MEMORY_MAP_SIZE = 268435456; // 256MB
const CACHE_SIZE = -64000; // 64MB
const BUSY_TIMEOUT = 5000;

/**
 * A high-level client for SQLite database operations with optimized performance settings.
 */
export class DbClient {
  readonly #db: Database;

  constructor(dbName = MEMORY_DB_NAME, options: DbClientOptions = {}) {
    this.#db = new SQLite(dbName);

    if (!options.skipPragmaSetup) {
      this.#setupPragmas(dbName);
    }
  }

  // Core Operations

  close(): void {
    this.#db.close();
  }

  exec(sql: string): Database {
    return this.#db.exec(sql);
  }

  prepare(sql: string): Statement {
    return this.#db.prepare(sql);
  }

  // Statement Execution

  run(stmt: Statement, params?: unknown[]): SQLite.RunResult {
    return params ? stmt.run(params) : stmt.run();
  }

  get<T = unknown>(stmt: Statement, params: unknown[] = []): T | undefined {
    return stmt.get(params) as T | undefined;
  }

  all<T = unknown>(stmt: Statement, params: unknown[] = []): T[] {
    return stmt.all(params) as T[];
  }

  // Query Helpers

  query<T = unknown>(sql: string, params: unknown[] = []): T[] {
    const stmt = this.prepare(sql);
    return this.all<T>(stmt, params);
  }

  queryOne<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
    const stmt = this.prepare(sql);
    return this.get<T>(stmt, params);
  }

  execute(sql: string, params: unknown[] = []): SQLite.RunResult {
    const stmt = this.prepare(sql);
    return this.run(stmt, params);
  }

  // Transactions

  transaction<T>(fn: () => T): T {
    const txn = this.#db.transaction(fn);
    return txn();
  }

  begin(): void {
    this.#db.exec("BEGIN");
  }

  commit(): void {
    this.#db.exec("COMMIT");
  }

  rollback(): void {
    this.#db.exec("ROLLBACK");
  }

  // Database Info & Utilities

  get isOpen(): boolean {
    return this.#db.open;
  }

  getDatabaseInfo(): DatabaseInfo {
    return {
      memory: this.#db.memory,
      readonly: this.#db.readonly,
      name: this.#db.memory ? "" : this.#db.name,
    };
  }

  async backup(destinationPath: string): Promise<void> {
    await this.#db.backup(destinationPath);
  }

  pragma<T = unknown>(name: string, value?: string | number | boolean): T {
    if (value !== undefined) {
      return this.#db.pragma(`${name} = ${value}`) as T;
    }

    const result = this.#db.pragma(name);

    if (Array.isArray(result) && result.length === 0) {
      throw new Error(`Unknown pragma: ${name}`);
    }

    if (this.#isPragmaResultObject(result, name)) {
      const resultArray = result as Record<string, unknown>[];
      return resultArray[0][name] as T;
    }

    return result as T;
  }

  // Private Methods

  #setupPragmas(dbName: string): void {
    this.#setEssentialPragmas();

    if (this.#isFileDatabase(dbName)) {
      this.#setFileOptimizations();
    }
  }

  #setEssentialPragmas(): void {
    this.#db.pragma("foreign_keys = ON");
    this.#db.pragma(`busy_timeout = ${BUSY_TIMEOUT}`);
  }

  #setFileOptimizations(): void {
    const currentJournalMode = this.#db.pragma("journal_mode", { simple: true }) as string;

    if (currentJournalMode.toLowerCase() !== "wal") {
      this.#db.pragma("journal_mode = WAL");
    }

    this.#db.pragma("temp_store = MEMORY");
    this.#db.pragma(`mmap_size = ${MEMORY_MAP_SIZE}`);
    this.#db.pragma(`cache_size = ${CACHE_SIZE}`);
  }

  #isFileDatabase(dbName: string): boolean {
    return dbName !== MEMORY_DB_NAME;
  }

  #isPragmaResultObject(result: unknown, name: string): result is Record<string, unknown>[] {
    return (
      Array.isArray(result) &&
      result.length > 0 &&
      typeof result[0] === "object" &&
      result[0] !== null &&
      name in (result[0] as Record<string, unknown>)
    );
  }
}
