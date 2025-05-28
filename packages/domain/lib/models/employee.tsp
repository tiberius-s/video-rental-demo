import "./person.tsp";
import "./value-objects/money.tsp";

namespace VideoRental.Domain;

using VideoRental.Domain.ValueObjects;

@doc("Employee entity")
model Employee {
  @key("employeeId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The ID of the employee")
  id: string;

  ...PersonBase;

  @format("date")
  @doc("The date the employee started working")
  startDate: string;

  @doc("The role of the employee")
  role: EmployeeRole;

  @doc("Hourly wage of the employee")
  hourlyWage: Money;

  @doc("Whether the employee is currently active")
  isActive: boolean;

  @doc("Employee discount percentage (0-100)")
  discountPercentage: decimal;
}

@doc("Role of an employee")
enum EmployeeRole {
  @doc("Store manager with full permissions")
  Manager,

  @doc("Shift supervisor with team leadership responsibilities")
  ShiftSupervisor,

  @doc("Store clerk handling day-to-day operations")
  Clerk,
}
