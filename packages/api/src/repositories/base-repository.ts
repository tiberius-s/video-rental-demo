import type { DbClient } from "@video-rental/db";
import type { PaginatedResult, PaginationOptions, Repository } from "../domain/repository.js";

/**
 * Base repository implementation using SQLite
 */
export abstract class BaseRepository<T, TId = string> implements Repository<T, TId> {
  constructor(
    protected readonly db: DbClient,
    protected readonly tableName: string,
  ) {}

  abstract findById(id: TId): Promise<T | null>;
  abstract findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  abstract create(entity: Omit<T, "id">): Promise<T>;
  abstract update(id: TId, entity: Partial<Omit<T, "id">>): Promise<T | null>;
  abstract delete(id: TId): Promise<boolean>;

  /**
   * Helper method to create paginated results
   */
  protected createPaginatedResult<U>(
    items: U[],
    total: number,
    options: PaginationOptions = {},
  ): PaginatedResult<U> {
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  /**
   * Helper method to build SQL pagination clause
   */
  protected buildPaginationClause(options: PaginationOptions = {}): string {
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    return `LIMIT ${limit} OFFSET ${offset}`;
  }

  /**
   * Helper method to count total records
   */
  protected async countTotal(whereClause = ""): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
    const stmt = this.db.prepare(query);
    const result = this.db.get(stmt) as { count: number } | undefined;
    return result?.count ?? 0;
  }

  /**
   * Helper method to generate UUID for new entities
   */
  protected generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Helper method to convert database row to entity
   */
  protected abstract mapRowToEntity(row: any): T;

  /**
   * Helper method to convert entity to database row
   */
  protected abstract mapEntityToRow(entity: Partial<T>): Record<string, any>;
}
