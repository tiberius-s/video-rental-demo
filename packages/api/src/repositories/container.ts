import type { DbClient } from "@video-rental/db";
import type {
  CustomerRepository,
  InventoryRepository,
  PaymentRepository,
  RentalRepository,
  VideoRepository,
} from "../domain/repository.js";
import {
  CustomerRepositoryImpl,
  InventoryRepositoryImpl,
  PaymentRepositoryImpl,
  RentalRepositoryImpl,
  VideoRepositoryImpl,
} from "./index.js";

/**
 * Repository container for dependency injection
 */
export class RepositoryContainer {
  private readonly customerRepo: CustomerRepository;
  private readonly videoRepo: VideoRepository;
  private readonly rentalRepo: RentalRepository;
  private readonly inventoryRepo: InventoryRepository;
  private readonly paymentRepo: PaymentRepository;

  constructor(private readonly db: DbClient) {
    this.customerRepo = new CustomerRepositoryImpl(db);
    this.videoRepo = new VideoRepositoryImpl(db);
    this.rentalRepo = new RentalRepositoryImpl(db);
    this.inventoryRepo = new InventoryRepositoryImpl(db);
    this.paymentRepo = new PaymentRepositoryImpl(db);
  }

  get customers(): CustomerRepository {
    return this.customerRepo;
  }

  get videos(): VideoRepository {
    return this.videoRepo;
  }

  get rentals(): RentalRepository {
    return this.rentalRepo;
  }

  get inventory(): InventoryRepository {
    return this.inventoryRepo;
  }

  get payments(): PaymentRepository {
    return this.paymentRepo;
  }

  /**
   * Close database connections
   */
  close(): void {
    this.db.close();
  }
}
