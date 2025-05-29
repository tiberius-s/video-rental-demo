// Customer Service - Essential Business Logic
import "../models/value-objects/money.tsp";

namespace VideoRental.Domain.Services;

using VideoRental.Domain.ValueObjects;

@doc("Core customer business logic service")
interface CustomerService {
  @doc("Check if customer is eligible to rent")
  checkRentalEligibility(
    @doc("Customer ID") customerId: string
  ): CustomerEligibility;

  @doc("Get customer discount percentage")
  getCustomerDiscountPercentage(
    @doc("Customer ID") customerId: string
  ): decimal;

  @doc("Calculate outstanding balance for customer")
  calculateOutstandingBalance(
    @doc("Customer ID") customerId: string
  ): Money;

  @doc("Get customer rental summary")
  getRentalSummary(
    @doc("Customer ID") customerId: string
  ): CustomerRentalSummary;
}

@doc("Customer rental eligibility information")
model CustomerEligibility {
  @doc("Whether customer can rent")
  eligible: boolean;

  @doc("Reason if not eligible")
  reason?: string;

  @doc("Number of active rentals")
  activeRentals: int32;

  @doc("Number of overdue rentals")
  overdueRentals: int32;

  @doc("Outstanding fees")
  outstandingFees: Money;

  @doc("Maximum allowed active rentals")
  maxActiveRentals: int32;
}

@doc("Customer rental summary")
model CustomerRentalSummary {
  @doc("Total lifetime rentals")
  totalRentals: int32;

  @doc("Currently active rentals")
  activeRentals: int32;

  @doc("Overdue rentals")
  overdueRentals: int32;

  @doc("Total amount spent")
  totalSpent: Money;

  @doc("Outstanding balance")
  outstandingBalance: Money;

  @doc("Customer discount percentage")
  discountPercentage: decimal;
}
