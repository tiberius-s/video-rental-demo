// Common repository types and interfaces
import type { components } from "./types.js";

// Extract the component schemas for easier use
export type Customer = components["schemas"]["Customer"];
export type Video = components["schemas"]["Video"];
export type Rental = components["schemas"]["Rental"];
export type Inventory = components["schemas"]["Inventory"];
export type Payment = components["schemas"]["Payment"];

// Common types
export type EntityId = string;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Base repository interface
export interface Repository<T, TId = EntityId> {
  findById(id: TId): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: TId, entity: Partial<Omit<T, "id">>): Promise<T | null>;
  delete(id: TId): Promise<boolean>;
}

// Customer repository interface
export interface CustomerRepository extends Repository<Customer> {
  findByEmail(email: string): Promise<Customer | null>;
  findActive(options?: PaginationOptions): Promise<PaginatedResult<Customer>>;
  deactivate(id: EntityId): Promise<boolean>;
}

// Video repository interface
export interface VideoRepository extends Repository<Video> {
  findByGenre(genre: string, options?: PaginationOptions): Promise<PaginatedResult<Video>>;
  findByTitle(title: string): Promise<Video[]>;
  findAvailable(options?: PaginationOptions): Promise<PaginatedResult<Video>>;
}

// Rental repository interface
export interface RentalRepository extends Repository<Rental> {
  findByCustomerId(
    customerId: EntityId,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Rental>>;
  findByVideoId(videoId: EntityId, options?: PaginationOptions): Promise<PaginatedResult<Rental>>;
  findActive(options?: PaginationOptions): Promise<PaginatedResult<Rental>>;
  findOverdue(options?: PaginationOptions): Promise<PaginatedResult<Rental>>;
  returnRental(id: EntityId, returnDate: Date): Promise<Rental | null>;
}

// Inventory repository interface
export interface InventoryRepository extends Repository<Inventory> {
  findByVideoId(videoId: EntityId): Promise<Inventory[]>;
  findAvailable(videoId?: EntityId): Promise<Inventory[]>;
  markAsRented(id: EntityId): Promise<boolean>;
  markAsAvailable(id: EntityId): Promise<boolean>;
  updateCondition(id: EntityId, condition: string): Promise<boolean>;
}

// Payment repository interface
export interface PaymentRepository extends Repository<Payment> {
  findByRentalId(rentalId: EntityId): Promise<Payment[]>;
  findByCustomerId(
    customerId: EntityId,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Payment>>;
  findPending(options?: PaginationOptions): Promise<PaginatedResult<Payment>>;
  findByStatus(status: Payment["status"]): Promise<Payment[]>;
  findByPaymentType(paymentType: Payment["paymentType"]): Promise<Payment[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Payment[]>;
  getTotalAmountByCustomerId(customerId: EntityId): Promise<number>;
  updateStatus(id: EntityId, status: Payment["status"]): Promise<Payment | null>;
  processRefund(paymentId: EntityId, refundAmount?: number): Promise<Payment | null>;
}
