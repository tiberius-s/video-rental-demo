namespace VideoRental.Domain.ValueObjects;

@doc("Money value object representing currency amounts")
model Money {
  @doc("The amount in the smallest currency unit (e.g., cents)")
  amount: decimal;

  @doc("Currency code (ISO 4217)")
  @minLength(3)
  @maxLength(3)
  currency: string;
}
