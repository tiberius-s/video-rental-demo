namespace VideoRental.Domain.ValueObjects;

@doc("Phone number value object with validation")
model PhoneNumber {
  @doc("Phone number in E.164 format")
  @pattern("^\\+[1-9]\\d{1,14}$")
  value: string;
}
