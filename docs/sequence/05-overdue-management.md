# Overdue Management Sequence Diagram

This diagram shows the simplified overdue rental management workflow.

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

1. **Automated Processing**: Daily batch job identifies overdue rentals
2. **Progressive Fees**: Late fees calculated per day overdue
3. **Customer Notifications**: Email alerts with detailed fee breakdown
4. **Simplified Workflow**: Single notification type, no escalation tiers
5. **Payment Integration**: Late fees automatically added to customer account

## Business Rules

- **Daily Processing**: System runs overdue check once per day
- **Late Fee Formula**: Days overdue × original daily rental rate
- **Discount Policy**: Customer discounts don't apply to late fees
- **Notification Timing**: Sent immediately when rental becomes overdue
- **Status Persistence**: Rentals remain "Overdue" until returned

## Error Handling

- **Email Failures**: Logged for manual follow-up
- **Database Errors**: Transaction rollback to prevent inconsistent state
- **Calculation Errors**: Default to base rental rate for late fees
- **Customer Account Issues**: Processing continues but flagged for review
