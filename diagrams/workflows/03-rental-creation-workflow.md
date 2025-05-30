# Rental Creation Workflow

## Overview

Complete rental transaction processing from customer eligibility verification to rental activation. Core business transaction with multi-step validation, customer discount application, and payment processing.

## Business Rules

- Customer must be active with no overdue rentals
- Video must have available inventory copies
- Customer discounts receive automatic discount calculation
- Payment required before rental activation
- Each rental links to specific inventory copy
- Rental period determined by video type and customer tier

## Workflow Diagram

```mermaid
flowchart TD
    A[Rental Request] --> B[Validate Input]
    B --> C{Valid?}
    C -->|No| D[Return Errors]
    C -->|Yes| E[Check Customer Eligibility]

    %% Customer Eligibility
    E --> F[Load Customer]
    F --> G{Active & No Overdue?}
    G -->|No| H[Return Blocked]
    G -->|Yes| I[Check Availability]

    %% Video Availability
    I --> J[Query Inventory]
    J --> K{Copies Available?}
    K -->|No| L[Return Unavailable]
    K -->|Yes| M[Reserve Copy]

    %% Pricing & Payment
    M --> N[Calculate Price]
    N --> O{Customer Discount?}
    O -->|Yes| P[Apply Discount]
    O -->|No| Q[Base Price]
    P --> R[Process Payment]
    Q --> R
    R --> S{Payment Success?}
    S -->|No| T[Release Reserve & Fail]
    S -->|Yes| U[Create Rental]

    %% Rental Activation
    U --> V[Set Rental Period]
    V --> W[Update Inventory Status]
    W --> X[Link Payment]
    X --> Y[Save Transaction]
    Y --> Z{Save Success?}
    Z -->|No| AA[Rollback All]
    Z -->|Yes| BB[Return Rental Confirmation]

    style A fill:#e1f5fe
    style BB fill:#c8e6c9
    style D fill:#ffcdd2
    style H fill:#ffcdd2
    style L fill:#ffcdd2
    style T fill:#ffcdd2
    style AA fill:#ffcdd2
```

## API Endpoints

| Method | Endpoint                         | Purpose                        |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/rentals`                       | Create new rental transaction  |
| GET    | `/rentals/{id}`                  | Retrieve rental details        |
| GET    | `/customers/{id}/rentals/active` | List customer's active rentals |
| GET    | `/videos/{id}/availability`      | Check video availability       |

## Key Features

- **Multi-step Validation**: Customer eligibility, video availability, payment processing
- **Customer Discounts**: Automatic discount application based on customer discount percentage
- **Inventory Management**: Real-time copy reservation and status updates
- **Transaction Integrity**: Complete rollback on any failure

## Integration Points

- **Customer Service**: Validates eligibility and applies employee discounts
- **Video Service**: Checks availability and retrieval pricing
- **Inventory Service**: Reserves and updates copy status
- **Payment Service**: Processes payment transactions
- **Database**: Maintains transactional integrity across all operations

## Error Handling

- **Customer Errors**: Inactive status, overdue rentals, limit exceeded
- **Video Errors**: Not found, inactive, no copies available
- **Payment Errors**: Invalid method, declined transaction, gateway issues
- **Transaction Errors**: Database failures, rollback procedures
