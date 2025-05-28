namespace VideoRental.Domain.ValueObjects;

@doc("Rental period value object representing the duration of a rental")
model RentalPeriod {
  @format("date-time")
  @doc("Start date and time of the rental")
  startDate: string;

  @format("date-time")
  @doc("Due date and time for return")
  dueDate: string;

  @format("date-time")
  @doc("Actual return date and time (null if not returned)")
  returnDate?: string;
}

@doc("Standard rental duration options")
enum StandardRentalDuration {
  @doc("1 day rental")
  OneDay,

  @doc("3 day rental")
  ThreeDays,

  @doc("1 week rental")
  OneWeek,

  @doc("2 week rental")
  TwoWeeks,
}
