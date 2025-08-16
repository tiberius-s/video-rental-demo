import { DbClient } from "@video-rental/db";
import { RepositoryContainer } from "./repositories/container.js";

// Example usage of the repository pattern
async function main() {
  // Initialize database
  const db = new DbClient(":memory:");

  // Initialize repository container
  const repositories = new RepositoryContainer(db);

  console.log("✅ API module initialized with repository pattern");
  console.log("📊 Available repositories:", {
    customers: "CustomerRepositoryImpl",
    videos: "VideoRepositoryImpl",
  });

  // Example: Create a customer (would typically be done through a service layer)
  try {
    const customer = await repositories.customers.create({
      name: "John Doe",
      email: { value: "john@example.com" },
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
      },
      phoneNumber: { value: "+1-555-0123" },
      discountPercentage: 10,
      memberSince: "2025-06-01",
      status: "Active",
    });

    console.log("✅ Example customer created:", customer.id);
  } catch {
    console.log("ℹ️  Repository pattern ready (database schema needed for actual operations)");
  }

  // Clean up
  repositories.close();
}

main().catch(console.error);
