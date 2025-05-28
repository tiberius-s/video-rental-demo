namespace VideoRental.Domain.ValueObjects;

@doc("Address value object representing a physical location")
model Address {
  @doc("Street address including number and street name")
  @minLength(1)
  @maxLength(255)
  street: string;

  @doc("City name")
  @minLength(1)
  @maxLength(100)
  city: string;

  @doc("US State")
  state: State;

  @doc("ZIP/Postal code")
  @pattern("^\\d{5}(-\\d{4})?$")
  zipCode: string;
}

enum State {
  AL,
  AK,
  AZ,
  AR,
  CA,
  CO,
  CT,
  DE,
  FL,
  GA,
  HI,
  ID,
  IL,
  IN,
  IA,
  KS,
  KY,
  LA,
  ME,
  MD,
  MA,
  MI,
  MN,
  MS,
  MO,
  MT,
  NE,
  NV,
  NH,
  NJ,
  NM,
  NY,
  NC,
  ND,
  OH,
  OK,
  OR,
  PA,
  RI,
  SC,
  SD,
  TN,
  TX,
  UT,
  VT,
  VA,
  WA,
  WV,
  WI,
  WY,
}
