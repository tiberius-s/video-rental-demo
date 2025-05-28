import "./person.tsp";

namespace VideoRental.Domain;

@doc("Customer entity for API operations")
model Customer {
  @key("customerId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The ID of the customer")
  id: string;

  ...PersonBase;

  @doc("Employee ID if this customer is also an employee (for discount purposes)")
  employeeId?: string;

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
