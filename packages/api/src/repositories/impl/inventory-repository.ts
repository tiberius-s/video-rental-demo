import type { DbClient } from "@video-rental/db";
import type {
  EntityId,
  Inventory,
  InventoryRepository,
  PaginatedResult,
  PaginationOptions,
} from "../../domain/repository.js";
import { BaseRepository } from "../base-repository.js";

export class InventoryRepositoryImpl
  extends BaseRepository<Inventory, EntityId>
  implements InventoryRepository
{
  constructor(db: DbClient) {
    super(db, "inventory");
  }

  async findById(id: EntityId): Promise<Inventory | null> {
    const stmt = this.db.prepare("SELECT * FROM inventory WHERE id = ?");
    const row = this.db.get(stmt, [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Inventory>> {
    const total = await this.countTotal();
    const stmt = this.db.prepare(`
      SELECT * FROM inventory
      ORDER BY date_acquired DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async create(entity: Omit<Inventory, "id">): Promise<Inventory> {
    const id = this.generateId();
    const inventory: Inventory = { id, ...entity };
    const row = this.mapEntityToRow(inventory);

    const stmt = this.db.prepare(`
      INSERT INTO inventory (
        id, video_id, copy_id, condition, status, date_acquired, last_rented_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    this.db.run(stmt, [
      row.id,
      row.video_id,
      row.copy_id,
      row.condition,
      row.status,
      row.date_acquired,
      row.last_rented_date,
      now,
      now,
    ]);

    return inventory;
  }

  async update(id: EntityId, entity: Partial<Omit<Inventory, "id">>): Promise<Inventory | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Inventory = { ...existing, ...entity };
    const row = this.mapEntityToRow(updated);

    const setParts: string[] = [];
    const values: any[] = [];

    if (entity.videoId !== undefined) {
      setParts.push("video_id = ?");
      values.push(row.video_id);
    }
    if (entity.copyId !== undefined) {
      setParts.push("copy_id = ?");
      values.push(row.copy_id);
    }
    if (entity.condition !== undefined) {
      setParts.push("condition = ?");
      values.push(row.condition);
    }
    if (entity.status !== undefined) {
      setParts.push("status = ?");
      values.push(row.status);
    }
    if (entity.dateAcquired !== undefined) {
      setParts.push("date_acquired = ?");
      values.push(row.date_acquired);
    }
    if (entity.lastRentedDate !== undefined) {
      setParts.push("last_rented_date = ?");
      values.push(row.last_rented_date);
    }

    if (setParts.length === 0) return existing;

    setParts.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE inventory
      SET ${setParts.join(", ")}
      WHERE id = ?
    `);

    this.db.run(stmt, values);
    return updated;
  }

  async delete(id: EntityId): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM inventory WHERE id = ?");
    const result = this.db.run(stmt, [id]);
    return result.changes > 0;
  }

  protected mapRowToEntity(row: any): Inventory {
    return {
      id: row.id,
      videoId: row.video_id,
      copyId: row.copy_id,
      condition: row.condition,
      status: row.status,
      dateAcquired: row.date_acquired,
      lastRentedDate: row.last_rented_date || undefined,
    };
  }

  protected mapEntityToRow(entity: Partial<Inventory>): Record<string, any> {
    return {
      id: entity.id,
      video_id: entity.videoId,
      copy_id: entity.copyId,
      condition: entity.condition,
      status: entity.status,
      date_acquired: entity.dateAcquired,
      last_rented_date: entity.lastRentedDate,
    };
  }

  // Business-specific methods
  async findByVideoId(videoId: EntityId): Promise<Inventory[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM inventory
      WHERE video_id = ?
      ORDER BY date_acquired DESC
    `);
    const rows = this.db.all(stmt, [videoId]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findAvailable(videoId?: EntityId): Promise<Inventory[]> {
    if (videoId) {
      const stmt = this.db.prepare(`
        SELECT * FROM inventory
        WHERE video_id = ? AND status = 'Available' AND condition = 'Good'
        ORDER BY date_acquired ASC
      `);
      const rows = this.db.all(stmt, [videoId]);
      return rows.map((row) => this.mapRowToEntity(row));
    } else {
      const stmt = this.db.prepare(`
        SELECT * FROM inventory
        WHERE status = 'Available' AND condition = 'Good'
        ORDER BY date_acquired ASC
      `);
      const rows = this.db.all(stmt);
      return rows.map((row) => this.mapRowToEntity(row));
    }
  }

  async markAsRented(id: EntityId): Promise<boolean> {
    const updated = await this.update(id, {
      status: "Rented",
      lastRentedDate: new Date().toISOString().split("T")[0],
    });
    return updated !== null;
  }

  async markAsAvailable(id: EntityId): Promise<boolean> {
    const updated = await this.update(id, { status: "Available" });
    return updated !== null;
  }

  async updateCondition(id: EntityId, condition: string): Promise<boolean> {
    const updated = await this.update(id, { condition: condition as Inventory["condition"] });
    return updated !== null;
  }
}
