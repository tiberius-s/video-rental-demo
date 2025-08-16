import type { DbClient } from "@video-rental/db";
import type {
  Customer,
  CustomerRepository,
  EntityId,
  PaginatedResult,
  PaginationOptions,
} from "../domain/repository.js";
import { BaseRepository } from "./base-repository.js";

export class CustomerRepositoryImpl extends BaseRepository<Customer> implements CustomerRepository {
  constructor(db: DbClient) {
    super(db, "customers");
  }

  async findById(id: EntityId): Promise<Customer | null> {
    const stmt = this.db.prepare("SELECT * FROM customers WHERE id = ? AND active = 1");
    const row = this.db.get(stmt, [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Customer>> {
    const total = await this.countTotal("WHERE active = 1");
    const stmt = this.db.prepare(`
      SELECT * FROM customers
      WHERE active = 1
      ORDER BY name ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async create(entity: Omit<Customer, "id">): Promise<Customer> {
    const id = this.generateId();
    const customer: Customer = { id, ...entity };
    const row = this.mapEntityToRow(customer);

    const stmt = this.db.prepare(`
      INSERT INTO customers (id, name, email, address_street, address_city, address_state, address_postal_code, address_country, phone_number, discount_percentage, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    this.db.run(stmt, [
      row.id,
      row.name,
      row.email,
      row.address_street,
      row.address_city,
      row.address_state,
      row.address_postal_code,
      row.address_country,
      row.phone_number,
      row.discount_percentage,
      1, // active
      now,
      now,
    ]);

    return customer;
  }

  async update(id: EntityId, entity: Partial<Omit<Customer, "id">>): Promise<Customer | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...entity };
    const row = this.mapEntityToRow(updated);

    const stmt = this.db.prepare(`
      UPDATE customers
      SET name = ?, email = ?, address_street = ?, address_city = ?, address_state = ?,
          address_postal_code = ?, address_country = ?, phone_number = ?,
          discount_percentage = ?, updated_at = ?
      WHERE id = ? AND active = 1
    `);

    const result = this.db.run(stmt, [
      row.name,
      row.email,
      row.address_street,
      row.address_city,
      row.address_state,
      row.address_postal_code,
      row.address_country,
      row.phone_number,
      row.discount_percentage,
      new Date().toISOString(),
      id,
    ]);

    return result.changes > 0 ? updated : null;
  }

  async delete(id: EntityId): Promise<boolean> {
    return this.deactivate(id);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const stmt = this.db.prepare("SELECT * FROM customers WHERE email = ? AND active = 1");
    const row = this.db.get(stmt, [email]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<Customer>> {
    return this.findAll(options); // All findAll results are already filtered for active customers
  }

  async deactivate(id: EntityId): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE customers
      SET active = 0, updated_at = ?
      WHERE id = ? AND active = 1
    `);

    const result = this.db.run(stmt, [new Date().toISOString(), id]);
    return result.changes > 0;
  }

  protected mapRowToEntity(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      email: {
        value: row.email,
      },
      address: {
        street: row.address || "",
        city: "",
        state: "CA", // Default state since we're storing address as single field
        zipCode: "",
      },
      phoneNumber: {
        value: row.phone_number,
      },
      discountPercentage: row.discount_percentage,
      memberSince: row.member_since,
      status: row.status,
    };
  }

  protected mapEntityToRow(entity: Partial<Customer>): Record<string, any> {
    // For simplicity, we'll store the full address as a single field
    let address = "";
    if (entity.address) {
      if (typeof entity.address === "string") {
        address = entity.address;
      } else {
        // Convert structured address to single string
        const parts = [
          entity.address.street,
          entity.address.city,
          entity.address.state,
          entity.address.zipCode,
        ].filter(Boolean);
        address = parts.join(", ");
      }
    }

    return {
      id: entity.id,
      name: entity.name,
      email: entity.email?.value,
      address,
      phone_number: entity.phoneNumber?.value,
      discount_percentage: entity.discountPercentage,
      member_since: entity.memberSince,
      status: entity.status,
    };
  }
}
