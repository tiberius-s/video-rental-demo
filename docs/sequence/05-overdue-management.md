# Overdue Management Sequence Diagram

This document describes the simplified workflow for managing overdue video rentals. The diagram below illustrates the automated daily process involving the System Scheduler, Rental API, Database, Notification Service, and the Customer.

## Sequence Flow

```mermaid
sequenceDiagram
    participant SYS as System Scheduler
    participant API as Rental API
    participant DB as Database
    participant NS as Notification Service
    participant C as Customer

    note over SYS, C: Simplified Overdue Management - Daily Processing

    SYS->>API: Daily overdue check
    note over SYS, API: Automated job runs daily

    API->>DB: Query rentals past due date
    note over API, DB: WHERE dueDate < TODAY AND status = 'Active'

    DB->>API: List of overdue rentals

    loop For each overdue rental
        API->>DB: Update rental status to 'Overdue'
        API->>DB: Calculate late fees
        note over API, DB: Days overdue × daily rental rate

        API->>DB: Create late fee payment record
        note over API, DB: PaymentType: 'LateFee', Status: 'Pending'

        DB->>API: Records updated

        API->>NS: Send overdue notification
        note over API, NS: Customer email + rental details + late fees

        NS->>C: Overdue notice email
        note over NS, C: Video title, days overdue, late fees due

        API->>DB: Log notification sent
        DB->>API: Notification logged
    end

    API->>SYS: Overdue processing complete
    note over API, SYS: Summary: X rentals processed, Y notifications sent
```

## Overdue Status Management

The state diagram below depicts the lifecycle of a rental's status as it transitions from active to overdue and eventually to returned.

```mermaid
stateDiagram-v2
    [*] --> Active: Rental created
    Active --> Overdue: Past due date
    Overdue --> Overdue: Daily late fee accrual
    Overdue --> Returned: Customer returns video
    Returned --> [*]: Process complete

    note right of Overdue: Late fees calculated daily
    note right of Returned: All fees must be paid
```

## Late Fee Calculation

The flowchart below outlines the logic for calculating late fees. It considers the number of days a rental is overdue and the daily rental rate, while also noting that customer discounts do not apply to penalty fees.

```mermaid
flowchart TD
    A[Rental Past Due] --> B[Calculate days overdue]
    B --> C[Days × Daily rental rate]
    C --> D{Customer has discount?}
    D -->|Yes| E[Apply discount to base rental only]
    D -->|No| F[Full late fee amount]
    E --> G[Late fees = Full late fee]
    F --> G
    G --> H[Create payment record]

    style G fill:#fff3e0
    style H fill:#ffcdd2

    note right of E: Discounts don't apply to penalties
```

## Notification Content

The mind map below details the information included in the overdue notification sent to customers. This ensures clarity regarding the overdue item, associated fees, and required actions.

```mermaid
mindmap
  root((Overdue Notice))
    Customer Info
      Name
      Account Status
    Rental Details
      Video Title
      Original Due Date
      Days Overdue
    Financial Info
      Original Rental Fee
      Late Fee Amount
      Total Amount Due
    Actions
      Return Instructions
      Payment Options
      Contact Information
```

## Key Features

The overdue management system includes the following key features:

- **Automated Processing**: A daily batch job automatically identifies and processes overdue rentals.
- **Progressive Fee Calculation**: Late fees are calculated based on the number of days a rental is overdue, ensuring fairness.
- **Customer Notifications**: Automated email alerts are sent to customers, providing a detailed breakdown of overdue items and associated fees.
- **Simplified Workflow**: The system employs a straightforward notification process without multiple escalation tiers for this simplified model.
- **Payment Integration**: Calculated late fees are automatically added to the customer's account for future payment.

## Business Rules

The overdue management process is governed by the following business rules:

- **Daily Processing Cycle**: The system performs the overdue check once every day.
- **Late Fee Formula**: Late fees are determined by multiplying the number of days overdue by the original daily rental rate of the item.
- **Discount Policy Adherence**: Customer discounts are not applicable to late fee penalties.
- **Notification Trigger**: Notifications are dispatched as soon as a rental's status changes to overdue.
- **Status Persistence**: A rental remains in the "Overdue" status until the item is returned by the customer.

## Error Handling

The system incorporates mechanisms to manage potential errors during overdue processing:

- **Email Delivery Failures**: If an email notification fails to send, the event is logged for manual follow-up by staff.
- **Database Transaction Errors**: In the event of database errors, transactions are rolled back to maintain data consistency and prevent an inconsistent state.
- **Calculation Discrepancies**: If errors occur during late fee calculation, the system defaults to using the base rental rate to determine the fee, ensuring a charge is still applied.
- **Customer Account Issues**: If issues related to a customer's account are detected, processing for that account continues, but the account is flagged for administrative review.
