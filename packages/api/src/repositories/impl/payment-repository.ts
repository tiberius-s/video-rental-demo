import type { DbClient } from "@video-rental/db";
import type {
  EntityId,
  PaginatedResult,
  PaginationOptions,
  Payment,
  PaymentRepository,
} from "../../domain/repository.js";
import { BaseRepository } from "../base-repository.js";

export class PaymentRepositoryImpl
  extends BaseRepository<Payment, EntityId>
  implements PaymentRepository
{
  constructor(db: DbClient) {
    super(db, "payments");
  }

  async findById(id: EntityId): Promise<Payment | null> {
    const stmt = this.db.prepare("SELECT * FROM payments WHERE id = ?");
    const row = this.db.get(stmt, [id]);
    return row ? this.mapRowToEntity(row) : null;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Payment>> {
    const total = await this.countTotal();
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      ORDER BY payment_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async create(entity: Omit<Payment, "id">): Promise<Payment> {
    const id = this.generateId();
    const payment: Payment = { id, ...entity };
    const row = this.mapEntityToRow(payment);

    const stmt = this.db.prepare(`
      INSERT INTO payments (
        id, customer_id, rental_id, amount_value, amount_currency,
        payment_type, payment_method, payment_date,
        reference_number, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    this.db.run(stmt, [
      row.id,
      row.customer_id,
      row.rental_id,
      row.amount_value,
      row.amount_currency,
      row.payment_type,
      row.payment_method,
      row.payment_date,
      row.reference_number,
      row.status,
      now,
      now,
    ]);

    return payment;
  }

  async update(id: EntityId, entity: Partial<Omit<Payment, "id">>): Promise<Payment | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Payment = { ...existing, ...entity };
    const row = this.mapEntityToRow(updated);

    const setParts: string[] = [];
    const values: any[] = [];

    if (entity.customerId !== undefined) {
      setParts.push("customer_id = ?");
      values.push(row.customer_id);
    }
    if (entity.rentalId !== undefined) {
      setParts.push("rental_id = ?");
      values.push(row.rental_id);
    }
    if (entity.amount !== undefined) {
      setParts.push("amount_value = ?", "amount_currency = ?");
      values.push(row.amount_value, row.amount_currency);
    }
    if (entity.paymentType !== undefined) {
      setParts.push("payment_type = ?");
      values.push(row.payment_type);
    }
    if (entity.paymentMethod !== undefined) {
      setParts.push("payment_method = ?");
      values.push(row.payment_method);
    }
    if (entity.paymentDate !== undefined) {
      setParts.push("payment_date = ?");
      values.push(row.payment_date);
    }
    if (entity.referenceNumber !== undefined) {
      setParts.push("reference_number = ?");
      values.push(row.reference_number);
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
      UPDATE payments
      SET ${setParts.join(", ")}
      WHERE id = ?
    `);

    this.db.run(stmt, values);
    return updated;
  }

  async delete(id: EntityId): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM payments WHERE id = ?");
    const result = this.db.run(stmt, [id]);
    return result.changes > 0;
  }

  protected mapRowToEntity(row: any): Payment {
    return {
      id: row.id,
      customerId: row.customer_id,
      rentalId: row.rental_id || undefined,
      amount: {
        amount: row.amount_value,
        currency: row.amount_currency,
      },
      paymentType: row.payment_type,
      paymentMethod: row.payment_method,
      paymentDate: row.payment_date,
      referenceNumber: row.reference_number || undefined,
      status: row.status,
    };
  }

  protected mapEntityToRow(entity: Partial<Payment>): Record<string, any> {
    return {
      id: entity.id,
      customer_id: entity.customerId,
      rental_id: entity.rentalId,
      amount_value: entity.amount?.amount,
      amount_currency: entity.amount?.currency,
      payment_type: entity.paymentType,
      payment_method: entity.paymentMethod,
      payment_date: entity.paymentDate,
      reference_number: entity.referenceNumber,
      status: entity.status,
    };
  }

  // Business-specific methods
  async findByRentalId(rentalId: EntityId): Promise<Payment[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      WHERE rental_id = ?
      ORDER BY payment_date DESC
    `);
    const rows = this.db.all(stmt, [rentalId]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByCustomerId(
    customerId: EntityId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Payment>> {
    const total = await this.countTotalWhere("WHERE customer_id = ?", [customerId]);
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      WHERE customer_id = ?
      ORDER BY payment_date DESC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt, [customerId]);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findPending(options: PaginationOptions = {}): Promise<PaginatedResult<Payment>> {
    const total = await this.countTotalWhere("WHERE status = 'Pending'");
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      WHERE status = 'Pending'
      ORDER BY payment_date ASC
      ${this.buildPaginationClause(options)}
    `);
    const rows = this.db.all(stmt);
    const items = rows.map((row) => this.mapRowToEntity(row));

    return this.createPaginatedResult(items, total, options);
  }

  async findByStatus(status: Payment["status"]): Promise<Payment[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      WHERE status = ?
      ORDER BY payment_date DESC
    `);
    const rows = this.db.all(stmt, [status]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByPaymentType(paymentType: Payment["paymentType"]): Promise<Payment[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      WHERE payment_type = ?
      ORDER BY payment_date DESC
    `);
    const rows = this.db.all(stmt, [paymentType]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      WHERE payment_date >= ? AND payment_date <= ?
      ORDER BY payment_date DESC
    `);
    const rows = this.db.all(stmt, [startDate, endDate]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async getTotalAmountByCustomerId(customerId: EntityId): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE customer_id = ? AND status = 'Completed'
    `);
    const result = this.db.get(stmt, [customerId]) as { total: number } | undefined;
    return result?.total || 0;
  }

  async updateStatus(id: EntityId, status: Payment["status"]): Promise<Payment | null> {
    return this.update(id, { status });
  }

  async processRefund(paymentId: EntityId, refundAmount?: number): Promise<Payment | null> {
    const originalPayment = await this.findById(paymentId);
    if (!originalPayment || originalPayment.status === "Refunded") {
      return null;
    }

    const refundAmountToUse = refundAmount ?? originalPayment.amount.amount;

    // Create the refund payment record
    const refundData: Omit<Payment, "id"> = {
      customerId: originalPayment.customerId,
      rentalId: originalPayment.rentalId,
      amount: {
        amount: -refundAmountToUse, // Negative amount for refund
        currency: originalPayment.amount.currency,
      },
      paymentType: originalPayment.paymentType,
      paymentMethod: originalPayment.paymentMethod,
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: `REFUND-${originalPayment.referenceNumber || originalPayment.id}`,
      status: "Completed",
    };

    const refund = await this.create(refundData);

    // Update original payment status to refunded
    await this.updateStatus(paymentId, "Refunded");

    return refund;
  }

  // Helper method for counting with WHERE clause
  private async countTotalWhere(whereClause: string, params: any[] = []): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
    const stmt = this.db.prepare(query);
    const result = this.db.get(stmt, params) as { count: number } | undefined;
    return result?.count ?? 0;
  }
}
