import type { DbClient } from "@video-rental/db";
import type {
  EntityId,
  PaginatedResult,
  PaginationOptions,
  Rental,
  RentalRepository,
} from "../../domain/repository.js";
import { BaseRepository } from "../base-repository.js";

export class RentalRepositoryImpl
  extends BaseRepository<Rental, EntityId>
  implements RentalRepository
{
  constructor(db: DbClient) {
    super(db, "rentals");
  }

  async findById(id: EntityId): Promise<Rental | null> {
    const stmt = this.db.prepare("SELECT * FROM rentals WHERE id = ?");
    const row = this.db.get(stmt, [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotal();
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      ORDER BY created_at DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async create(entity: Omit<Rental, "id">): Promise<Rental> {
    const id = this.generateId();
    const rental: Rental = { id, ...entity };
    const row = this.mapEntityToRow(rental);

    const stmt = this.db.prepare(`
      INSERT INTO rentals (
        id, customer_id, video_id, inventory_id,
        rental_date, due_date, return_date,
        rental_fee_amount, rental_fee_currency,
        late_fee_amount, late_fee_currency,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    this.db.run(stmt, [
      row.id,
      row.customer_id,
      row.video_id,
      row.inventory_id,
      row.rental_date,
      row.due_date,
      row.return_date,
      row.rental_fee_amount,
      row.rental_fee_currency,
      row.late_fee_amount,
      row.late_fee_currency,
      row.status,
      now,
      now,
    ]);

    return rental;
  }

  async update(id: EntityId, entity: Partial<Omit<Rental, "id">>): Promise<Rental | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Rental = { ...existing, ...entity };
    const row = this.mapEntityToRow(updated);

    const setParts: string[] = [];
    const values: any[] = [];

    if (entity.customerId !== undefined) {
      setParts.push("customer_id = ?");
      values.push(row.customer_id);
    }
    if (entity.videoId !== undefined) {
      setParts.push("video_id = ?");
      values.push(row.video_id);
    }
    if (entity.inventoryId !== undefined) {
      setParts.push("inventory_id = ?");
      values.push(row.inventory_id);
    }
    if (entity.period?.startDate !== undefined) {
      setParts.push("rental_date = ?");
      values.push(row.rental_date);
    }
    if (entity.period?.dueDate !== undefined) {
      setParts.push("due_date = ?");
      values.push(row.due_date);
    }
    if (entity.period?.returnDate !== undefined) {
      setParts.push("return_date = ?");
      values.push(row.return_date);
    }
    if (entity.rentalFee !== undefined) {
      setParts.push("rental_fee_amount = ?", "rental_fee_currency = ?");
      values.push(row.rental_fee_amount, row.rental_fee_currency);
    }
    if (entity.lateFee !== undefined) {
      setParts.push("late_fee_amount = ?", "late_fee_currency = ?");
      values.push(row.late_fee_amount, row.late_fee_currency);
    }
    if (entity.status !== undefined) {
      setParts.push("status = ?");
      values.push(row.status);
    }

    if (setParts.length === 0) return existing;

    setParts.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE rentals
      SET ${setParts.join(", ")}
      WHERE id = ?
    `);

    this.db.run(stmt, values);
    return updated;
  }

  async delete(id: EntityId): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM rentals WHERE id = ?");
    const result = this.db.run(stmt, [id]);
    return result.changes > 0;
  }

  protected mapRowToEntity(row: any): Rental {
    return {
      id: row.id,
      customerId: row.customer_id,
      videoId: row.video_id,
      inventoryId: row.inventory_id,
      period: {
        startDate: row.rental_date,
        dueDate: row.due_date,
        returnDate: row.return_date || undefined,
      },
      rentalFee: {
        amount: row.rental_fee_amount,
        currency: row.rental_fee_currency,
      },
      lateFee: row.late_fee_amount
        ? {
            amount: row.late_fee_amount,
            currency: row.late_fee_currency,
          }
        : undefined,
      status: row.status,
    };
  }

  protected mapEntityToRow(entity: Partial<Rental>): Record<string, any> {
    return {
      id: entity.id,
      customer_id: entity.customerId,
      video_id: entity.videoId,
      inventory_id: entity.inventoryId,
      rental_date: entity.period?.startDate,
      due_date: entity.period?.dueDate,
      return_date: entity.period?.returnDate,
      rental_fee_amount: entity.rentalFee?.amount,
      rental_fee_currency: entity.rentalFee?.currency,
      late_fee_amount: entity.lateFee?.amount,
      late_fee_currency: entity.lateFee?.currency,
      status: entity.status,
    };
  }

  // Business-specific methods
  async findByCustomerId(
    customerId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotalWhere("WHERE customer_id = ?", [customerId]);
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      WHERE customer_id = ?
      ORDER BY rental_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt, [customerId]);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findActiveByCustomerId(
    customerId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotalWhere("WHERE customer_id = ? AND status = 'Active'", [
      customerId,
    ]);
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      WHERE customer_id = ? AND status = 'Active'
      ORDER BY rental_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt, [customerId]);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findOverdue(options: PaginationOptions = {}): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotalWhere(
      "WHERE status = 'Active' AND due_date < datetime('now')",
    );
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      WHERE status = 'Active' AND due_date < datetime('now')
      ORDER BY due_date ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findByVideoId(
    videoId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotalWhere("WHERE video_id = ?", [videoId]);
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      WHERE video_id = ?
      ORDER BY rental_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt, [videoId]);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findByInventoryId(
    inventoryId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotalWhere("WHERE inventory_id = ?", [inventoryId]);
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      WHERE inventory_id = ?
      ORDER BY rental_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt, [inventoryId]);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async markReturned(id: string, returnDate: string): Promise<Rental | undefined> {
    const current = await this.findById(id);
    if (!current) return undefined;

    const updated = await this.update(id, {
      status: "Returned",
      period: {
        ...current.period,
        returnDate,
      },
    });

    return updated || undefined;
  }

  async addLateFee(
    id: string,
    lateFee: { amount: number; currency: string },
  ): Promise<Rental | undefined> {
    const updated = await this.update(id, { lateFee });
    return updated || undefined;
  }

  // Missing interface methods
  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<Rental>> {
    const total = await this.countTotalWhere("WHERE status = 'Active'");
    const stmt = this.db.prepare(`
      SELECT * FROM rentals
      WHERE status = 'Active'
      ORDER BY rental_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async returnRental(id: EntityId, returnDate: Date): Promise<Rental | null> {
    return this.update(id, {
      status: "Returned",
      period: {
        returnDate: returnDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
      } as any, // Will be merged with existing period data in update method
    });
  }

  // Helper method for counting with WHERE clause
  private async countTotalWhere(whereClause: string, params: any[] = []): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
    const stmt = this.db.prepare(query);
    const result = this.db.get(stmt, params) as { count: number } | undefined;
    return result?.count ?? 0;
  }
}
