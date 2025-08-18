import "./value-objects/money.tsp";

namespace VideoRental.Domain;

using VideoRental.Domain.ValueObjects;

@doc("Payment transaction for rentals and fees")
model Payment {
  @key("paymentId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The unique ID of the payment")
  id: string;

  @doc("The ID of the customer making the payment")
  customerId: string;

  @doc("The ID of the rental this payment is for")
  rentalId?: string;

  @doc("Amount paid")
  amount: Money;

  @doc("Type of payment")
  paymentType: PaymentType;

  @doc("Payment method used")
  paymentMethod: PaymentMethod;

  @format("date-time")
  @doc("Date and time of payment")
  paymentDate: string;

  @doc("Reference number for the payment")
  referenceNumber?: string;

  @doc("Current status of the payment")
  status: PaymentStatus;
}

@doc("Type of payment being made")
enum PaymentType {
  @doc("Payment for video rental")
  Rental,

  @doc("Payment for late fees")
  LateFee,

  @doc("Payment for damaged item")
  Damage,

  @doc("Membership fee")
  Membership,
}

@doc("Method of payment")
enum PaymentMethod {
  @doc("Cash payment")
  Cash,

  @doc("Credit card payment")
  CreditCard,

  @doc("Debit card payment")
  DebitCard,

  @doc("Check payment")
  Check,

  @doc("Gift card payment")
  GiftCard,
}

@doc("Status of a payment")
enum PaymentStatus {
  @doc("Payment completed successfully")
  Completed,

  @doc("Payment is pending")
  Pending,

  @doc("Payment failed")
  Failed,

  @doc("Payment was refunded")
  Refunded,

  @doc("Payment was cancelled")
  Cancelled,
}

@doc("Response containing customer payments and summary")
model CustomerPaymentsResponse {
  @doc("Customer payments")
  payments: PaginatedResponse<Payment>;

  @doc("Total paid")
  totalPaid: Money;

  @doc("Outstanding balance")
  outstandingBalance: Money;
}
