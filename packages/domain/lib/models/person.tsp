import "./value-objects/address.tsp";
import "./value-objects/email.tsp";
import "./value-objects/phone-number.tsp";

namespace VideoRental.Domain;

using VideoRental.Domain.ValueObjects;

@doc("Base person model with common personal information (excluding id)")
model PersonBase {
  @doc("The name of the person")
  @minLength(1)
  @maxLength(255)
  name: string;

  @doc("The email of the person")
  email: Email;

  @doc("The address of the person")
  address: Address;

  @doc("The phone number of the person")
  phoneNumber: PhoneNumber;
}
