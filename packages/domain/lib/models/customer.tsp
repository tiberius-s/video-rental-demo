import "./value-objects/address.tsp";
import "./value-objects/email.tsp";
import "./value-objects/phone-number.tsp";

namespace VideoRental.Domain;

using VideoRental.Domain.ValueObjects;

@doc("Customer entity for API operations")
model Customer {
  @key("customerId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The ID of the customer")
  id: string;

  @doc("The name of the customer")
  @minLength(1)
  @maxLength(255)
  name: string;

  @doc("The email of the customer")
  email: Email;

  @doc("The address of the customer")
  address: Address;

  @doc("The phone number of the customer")
  phoneNumber: PhoneNumber;

  @doc("Customer discount percentage (0-100)")
  discountPercentage?: decimal;

  @format("date")
  @doc("Date customer joined")
  memberSince: string;

  @doc("Current customer status")
  status: CustomerStatus;
}

@doc("Customer status for API operations")
enum CustomerStatus {
  @doc("Active customer")
  Active,

  @doc("Suspended customer")
  Suspended,

  @doc("Inactive customer")
  Inactive,
}
