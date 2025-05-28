namespace VideoRental.Domain.ValueObjects;

@doc("Email value object with validation")
model Email {
  @doc("Email address")
  @format("email")
  value: string;
}
