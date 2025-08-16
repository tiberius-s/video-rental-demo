import type { DbClient } from "@video-rental/db";
import type {
  CustomerRepository,
  EntityId,
  PaginatedResult,
  PaginationOptions,
} from "../../domain/repository.js";
import type { components } from "../../domain/types.js";
import { BaseRepository } from "../base-repository.js";

type Customer = components["schemas"]["Customer"];

export class SqliteCustomerRepository
  extends BaseRepository<Customer>
  implements CustomerRepository
{
  constructor(db: DbClient) {
    super(db, "customers");
  }

  async findById(id: EntityId): Promise<Customer | null> {
    const stmt = this.db.prepare("SELECT * FROM customers WHERE id = ?");
    const row = this.db.get(stmt, [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Customer>> {
    const total = await this.countTotal("");
    const stmt = this.db.prepare(`
      SELECT * FROM customers
      ORDER BY name ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async create(entity: Omit<Customer, "id">): Promise<Customer> {
    const id = this.generateId();
    const now = new Date().toISOString();
    const customer: Customer = {
      id,
      ...entity,
      memberSince: entity.memberSince || now.split("T")[0], // Default to today if not provided
      status: entity.status || "Active", // Default to Active if not provided
    };
    const row = this.mapEntityToRow(customer);

    const stmt = this.db.prepare(`
      INSERT INTO customers (
        id, name, email, address, phone_number,
        discount_percentage, member_since, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.run(stmt, [
      row.id,
      row.name,
      row.email,
      row.address,
      row.phone_number,
      row.discount_percentage,
      row.member_since,
      row.status,
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
      SET name = ?, email = ?, address = ?, phone_number = ?,
          discount_percentage = ?, member_since = ?, status = ?,
          updated_at = ?
      WHERE id = ?
    `);

    const result = this.db.run(stmt, [
      row.name,
      row.email,
      row.address,
      row.phone_number,
      row.discount_percentage,
      row.member_since,
      row.status,
      new Date().toISOString(),
      id,
    ]);

    return result.changes > 0 ? updated : null;
  }

  async delete(id: EntityId): Promise<boolean> {
    return this.deactivate(id);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const stmt = this.db.prepare("SELECT * FROM customers WHERE email = ?");
    const row = this.db.get(stmt, [email]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<Customer>> {
    return this.findAll(options); // All findAll results are already filtered for active customers
  }

  async deactivate(id: EntityId): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE customers
      SET status = 'Inactive', updated_at = ?
      WHERE id = ?
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
      email: typeof entity.email === "string" ? entity.email : entity.email?.value,
      address,
      phone_number:
        typeof entity.phoneNumber === "string" ? entity.phoneNumber : entity.phoneNumber?.value,
      discount_percentage: entity.discountPercentage,
      member_since: entity.memberSince,
      status: entity.status,
    };
  }
}
