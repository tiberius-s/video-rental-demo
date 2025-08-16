// Repository implementations
export { SqliteCustomerRepository as CustomerRepositoryImpl } from "./impl/customer-repository.js";
export { InventoryRepositoryImpl } from "./impl/inventory-repository.js";
export { PaymentRepositoryImpl } from "./impl/payment-repository.js";
export { RentalRepositoryImpl } from "./impl/rental-repository.js";
export { VideoRepositoryImpl } from "./impl/video-repository.js";

// Base repository
export { BaseRepository } from "./base-repository.js";

// Repository container
export { RepositoryContainer } from "./container.js";

// Repository interfaces (re-exported for convenience)
export type {
  CustomerRepository,
  EntityId,
  InventoryRepository,
  PaginatedResult,
  PaginationOptions,
  PaymentRepository,
  RentalRepository,
  Repository,
  VideoRepository,
} from "../domain/repository.js";
