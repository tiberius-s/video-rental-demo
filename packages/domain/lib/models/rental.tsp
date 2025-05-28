import "./value-objects/money.tsp";
import "./value-objects/rental-period.tsp";

namespace VideoRental.Domain;

using VideoRental.Domain.ValueObjects;

@doc("Rental entity for API operations")
model Rental {
  @key("rentalId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The unique ID of the rental")
  id: string;

  @doc("The ID of the customer renting the video")
  customerId: string;

  @doc("The ID of the video being rented")
  videoId: string;

  @doc("The ID of the specific inventory copy being rented")
  inventoryId: string;

  @doc("Rental period information")
  period: RentalPeriod;

  @doc("The rental fee paid")
  rentalFee: Money;

  @doc("Any late fees incurred")
  lateFee?: Money;

  @doc("Current status of the rental")
  status: RentalStatus;
}

@doc("Status of a rental")
enum RentalStatus {
  @doc("Rental is currently active")
  Active,

  @doc("Video has been returned on time")
  Returned,

  @doc("Rental is overdue")
  Overdue,

  @doc("Rental was cancelled")
  Cancelled,

  @doc("Rental was extended")
  Extended,
}
