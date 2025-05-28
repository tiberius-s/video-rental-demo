// Rental Service - Core Business Logic
import "../models/value-objects/money.tsp";
import "../models/value-objects/rental-period.tsp";

namespace VideoRental.Domain.Services;

using VideoRental.Domain.ValueObjects;

@doc("Core rental business logic service")
interface RentalService {
  @doc("Calculate rental price with employee discount")
  calculateRentalPrice(
    @doc("Base price of video") basePrice: Money,
    @doc("Duration of rental") duration: StandardRentalDuration,
    @doc("Employee discount percentage (0-100)") employeeDiscountPercentage?: decimal
  ): RentalPriceCalculation;

  @doc("Calculate late fees for overdue rental")
  calculateLateFees(
    @doc("Due date") dueDate: string,
    @doc("Return date") returnDate: string,
    @doc("Daily late fee rate") dailyRate: Money
  ): Money;

  @doc("Check if video is available for rental")
  checkVideoAvailability(
    @doc("Video ID") videoId: string
  ): VideoAvailability;

  @doc("Reserve a video copy for rental")
  reserveVideoCopy(
    @doc("Video ID") videoId: string
  ): string; // Returns inventory copy ID

  @doc("Release video copy after return")
  releaseVideoCopy(
    @doc("Inventory copy ID") inventoryId: string,
    @doc("Condition after return") condition: "Excellent" | "Good" | "Fair" | "Damaged"
  ): void;
}

@doc("Rental price calculation result")
model RentalPriceCalculation {
  @doc("Original price before discount")
  basePrice: Money;

  @doc("Employee discount amount")
  discountAmount: Money;

  @doc("Final price after discount")
  finalPrice: Money;

  @doc("Discount percentage applied")
  discountPercentage: decimal;
}

@doc("Video availability information")
model VideoAvailability {
  @doc("Whether video is available")
  available: boolean;

  @doc("Number of copies available")
  availableCopies: int32;

  @doc("Total copies owned")
  totalCopies: int32;

  @doc("Next expected return date if no copies available")
  nextAvailableDate?: string;
}
