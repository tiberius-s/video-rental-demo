// Rental Service - Core Business Logic
import "../models/value-objects/money.tsp";
import "../models/value-objects/rental-period.tsp";

namespace VideoRental.Domain.Services;

using VideoRental.Domain.ValueObjects;

@doc("Core rental business logic service - streamlined for essential operations")
interface RentalService {
  @doc("Calculate rental period with due date from start date and duration")
  createRentalPeriod(
    @doc("Start date of rental") startDate: string,
    @doc("Duration of rental") duration: StandardRentalDuration
  ): RentalPeriod;

  @doc("Calculate rental price with optional customer discount")
  calculateRentalPrice(
    @doc("Base price of video") basePrice: Money,
    @doc("Duration of rental") duration: StandardRentalDuration,
    @doc("Customer discount percentage (0-100)") customerDiscountPercentage?: decimal
  ): RentalPriceCalculation;

  @doc("Calculate late fees for overdue rental")
  calculateLateFees(
    @doc("Due date") dueDate: string,
    @doc("Return date") returnDate: string,
    @doc("Daily late fee rate") dailyRate: Money
  ): Money;
}

@doc("Rental price calculation result")
model RentalPriceCalculation {
  @doc("Original price before discount")
  basePrice: Money;

  @doc("Customer discount amount")
  discountAmount: Money;

  @doc("Final price after discount")
  finalPrice: Money;

  @doc("Discount percentage applied")
  discountPercentage: decimal;
}
