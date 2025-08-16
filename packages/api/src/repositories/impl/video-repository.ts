import type { DbClient } from "@video-rental/db";
import type {
  EntityId,
  PaginatedResult,
  PaginationOptions,
  Video,
  VideoRepository,
} from "../../domain/repository.js";
import { BaseRepository } from "../base-repository.js";

export class VideoRepositoryImpl
  extends BaseRepository<Video, EntityId>
  implements VideoRepository
{
  constructor(db: DbClient) {
    super(db, "videos");
  }

  async findById(id: EntityId): Promise<Video | null> {
    const stmt = this.db.prepare("SELECT * FROM videos WHERE id = ?");
    const row = this.db.get(stmt, [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Video>> {
    const total = await this.countTotal();
    const stmt = this.db.prepare(`
      SELECT * FROM videos
      ORDER BY title ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async create(entity: Omit<Video, "id">): Promise<Video> {
    const id = this.generateId();
    const video: Video = { id, ...entity };
    const row = this.mapEntityToRow(video);

    const stmt = this.db.prepare(`
      INSERT INTO videos (id, title, genre, rating, release_year, duration, description, director, rental_price, available_copies, total_copies, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    this.db.run(stmt, [
      row.id,
      row.title,
      row.genre,
      row.rating,
      row.release_year,
      row.duration,
      row.description,
      row.director,
      row.rental_price,
      row.available_copies,
      row.total_copies,
      now,
      now,
    ]);

    return video;
  }

  async update(id: EntityId, entity: Partial<Omit<Video, "id">>): Promise<Video | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...entity };
    const row = this.mapEntityToRow(updated);

    const stmt = this.db.prepare(`
      UPDATE videos
      SET title = ?, genre = ?, rating = ?, release_year = ?, duration = ?,
          description = ?, director = ?, rental_price = ?, available_copies = ?,
          total_copies = ?, updated_at = ?
      WHERE id = ?
    `);

    const result = this.db.run(stmt, [
      row.title,
      row.genre,
      row.rating,
      row.release_year,
      row.duration,
      row.description,
      row.director,
      row.rental_price,
      row.available_copies,
      row.total_copies,
      new Date().toISOString(),
      id,
    ]);

    return result.changes > 0 ? updated : null;
  }

  async delete(id: EntityId): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM videos WHERE id = ?");
    const result = this.db.run(stmt, [id]);
    return result.changes > 0;
  }

  async findByGenre(
    genre: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Video>> {
    const total = await this.countTotal("WHERE genre = ?", [genre]);
    const stmt = this.db.prepare(`
      SELECT * FROM videos
      WHERE genre = ?
      ORDER BY title ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt, [genre]);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findByTitle(title: string): Promise<Video[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM videos
      WHERE title LIKE ?
      ORDER BY title ASC
    `);
    const rows = this.db.all(stmt, [`%${title}%`]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findAvailable(options: PaginationOptions = {}): Promise<PaginatedResult<Video>> {
    const total = await this.countTotal(`
      WHERE EXISTS (
        SELECT 1 FROM inventory
        WHERE inventory.video_id = videos.id
        AND inventory.status = 'available'
      )
    `);

    const stmt = this.db.prepare(`
      SELECT DISTINCT v.* FROM videos v
      INNER JOIN inventory i ON v.id = i.video_id
      WHERE i.status = 'available'
      ORDER BY v.title ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  protected mapRowToEntity(row: any): Video {
    return {
      id: row.id,
      title: row.title,
      genre: row.genre,
      rating: row.rating,
      releaseYear: row.release_year,
      duration: row.duration,
      description: row.description,
      director: row.director,
      rentalPrice: row.rental_price || 0,
      availableCopies: row.available_copies || 0,
      totalCopies: row.total_copies || 0,
    };
  }

  protected mapEntityToRow(entity: Partial<Video>): Record<string, any> {
    return {
      id: entity.id,
      title: entity.title,
      genre: entity.genre,
      rating: entity.rating,
      release_year: entity.releaseYear,
      duration: entity.duration,
      description: entity.description,
      director: entity.director,
      rental_price: entity.rentalPrice,
      available_copies: entity.availableCopies,
      total_copies: entity.totalCopies,
    };
  }

  protected async countTotal(whereClause = "", params: any[] = []): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
    const stmt = this.db.prepare(query);
    const result = this.db.get(stmt, params) as { count: number } | undefined;
    return result?.count ?? 0;
  }
}
